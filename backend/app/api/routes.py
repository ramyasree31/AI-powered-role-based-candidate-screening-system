import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

import pymupdf as fitz
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/api")

ROLES = ["AI/ML Engineer", "Data Scientist", "Python Developer"]
MAX_RESUME_SIZE = 10 * 1024 * 1024


class AnswerSubmission(BaseModel):
    question_index: int = Field(ge=0)
    question: str = Field(min_length=1, max_length=2000)
    topic: str = Field(min_length=1, max_length=200)
    answer: str = Field(min_length=1, max_length=4000)

    @field_validator("question", "topic", "answer")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("This field must not be blank.")
        return value.strip()


def _database_path() -> Path:
    database_path = os.environ.get("DATABASE_PATH")
    if database_path:
        return Path(database_path)

    database_url = os.environ.get("DATABASE_URL", "")
    if database_url.startswith("sqlite:///"):
        return Path(database_url.removeprefix("sqlite:///"))
    if database_url:
        raise RuntimeError("Only SQLite DATABASE_URL values are supported.")

    return Path(__file__).resolve().parents[2] / "data" / "candidates.db"


def _connect() -> sqlite3.Connection:
    path = _database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=15)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS interview_sessions (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            resume_filename TEXT NOT NULL,
            resume_size INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS interview_answers (
            session_id TEXT NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
            question_index INTEGER NOT NULL,
            question TEXT NOT NULL,
            topic TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (session_id, question_index)
        );
        """
    )
    return connection


def _session_or_404(connection: sqlite3.Connection, session_id: str) -> sqlite3.Row:
    session = connection.execute(
        "SELECT * FROM interview_sessions WHERE id = ?", (session_id,)
    ).fetchone()
    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return session


def _session_payload(
    connection: sqlite3.Connection, session: sqlite3.Row
) -> dict:
    answers = connection.execute(
        """
        SELECT question_index, question, topic, answer, created_at
        FROM interview_answers
        WHERE session_id = ?
        ORDER BY question_index
        """,
        (session["id"],),
    ).fetchall()
    return {
        "id": session["id"],
        "role": session["role"],
        "resume": {
            "name": session["resume_filename"],
            "size": session["resume_size"],
        },
        "candidate_profile": None,
        "analysis_status": "not_available",
        "question_index": len(answers),
        "answers": [dict(answer) for answer in answers],
        "completed": bool(session["completed"]),
        "created_at": session["created_at"],
    }


@router.get("/roles")
def get_roles() -> dict:
    return {"roles": ROLES}


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    role: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
) -> dict:
    if role not in ROLES:
        raise HTTPException(status_code=422, detail="Select a supported interview role.")
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Upload a PDF resume.")

    content = await file.read(MAX_RESUME_SIZE + 1)
    if len(content) > MAX_RESUME_SIZE:
        raise HTTPException(status_code=413, detail="Resume must be 10 MB or smaller.")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid PDF.")

    try:
        document = fitz.open(stream=content, filetype="pdf")
        document.close()
    except (fitz.FileDataError, RuntimeError) as error:
        raise HTTPException(status_code=415, detail="The uploaded PDF could not be opened.") from error

    session_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    connection = _connect()
    try:
        connection.execute(
            """
            INSERT INTO interview_sessions
                (id, role, resume_filename, resume_size, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                session_id,
                role,
                file.filename.replace("\\", "/").rsplit("/", 1)[-1],
                len(content),
                created_at,
            ),
        )
        connection.commit()
        session = _session_or_404(connection, session_id)
        return _session_payload(connection, session)
    finally:
        connection.close()


@router.get("/sessions/{session_id}")
def get_session(session_id: str) -> dict:
    connection = _connect()
    try:
        session = _session_or_404(connection, session_id)
        return _session_payload(connection, session)
    finally:
        connection.close()


@router.post("/sessions/{session_id}/answers")
def submit_answer(session_id: str, submission: AnswerSubmission) -> dict:
    connection = _connect()
    try:
        session = _session_or_404(connection, session_id)
        if session["completed"]:
            raise HTTPException(status_code=409, detail="This interview is already complete.")

        answer_count = connection.execute(
            "SELECT COUNT(*) FROM interview_answers WHERE session_id = ?", (session_id,)
        ).fetchone()[0]
        if submission.question_index > answer_count:
            raise HTTPException(
                status_code=409,
                detail="Answer the current question before submitting a later one.",
            )

        connection.execute(
            """
            INSERT INTO interview_answers
                (session_id, question_index, question, topic, answer, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(session_id, question_index) DO UPDATE SET
                question = excluded.question,
                topic = excluded.topic,
                answer = excluded.answer,
                created_at = excluded.created_at
            """,
            (
                session_id,
                submission.question_index,
                submission.question,
                submission.topic,
                submission.answer,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        connection.commit()
        session = _session_or_404(connection, session_id)
        return _session_payload(connection, session)
    finally:
        connection.close()


@router.post("/sessions/{session_id}/complete")
def complete_session(session_id: str) -> dict:
    connection = _connect()
    try:
        _session_or_404(connection, session_id)
        connection.execute(
            "UPDATE interview_sessions SET completed = 1 WHERE id = ?", (session_id,)
        )
        connection.commit()
        session = _session_or_404(connection, session_id)
        return _session_payload(connection, session)
    finally:
        connection.close()


@router.get("/sessions/{session_id}/report")
def get_report(session_id: str) -> dict:
    connection = _connect()
    try:
        session = _session_or_404(connection, session_id)
        payload = _session_payload(connection, session)
        return {
            **payload,
            "evaluation_available": False,
            "overall_score": None,
            "topic_performance": [],
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "retrieval_context_available": False,
        }
    finally:
        connection.close()
