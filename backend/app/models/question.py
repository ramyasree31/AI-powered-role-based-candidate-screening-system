from typing import Any

from sqlalchemy import ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database import Base


class Question(Base):
    __tablename__ = "interview_questions"
    __table_args__ = (
        UniqueConstraint("session_id", "question_index", name="uq_question_session_index"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_index: Mapped[int] = mapped_column(Integer, nullable=False)
    question: Mapped[str] = mapped_column(String, nullable=False)
    question_type: Mapped[str | None] = mapped_column(String, nullable=True)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)
    expected_key_points: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    source_chunk_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    retrieval_query: Mapped[str | None] = mapped_column(String, nullable=True)
    rationale: Mapped[str | None] = mapped_column(String, nullable=True)
    retrieved_chunks: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    session = relationship("InterviewSession", back_populates="questions")
