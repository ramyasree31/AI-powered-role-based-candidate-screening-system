from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database import Base

if TYPE_CHECKING:
    from app.models.answer import Answer
    from app.models.candidate_profile import CandidateProfile
    from app.models.question import Question
    from app.models.report import InterviewReport


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    role: Mapped[str] = mapped_column(String, nullable=False)
    resume_filename: Mapped[str] = mapped_column(String, nullable=False)
    resume_size: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default=utc_timestamp,
    )
    completed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("0"),
    )

    candidate_profile: Mapped["CandidateProfile | None"] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    questions: Mapped[list["Question"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Question.question_index",
    )
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Answer.question_index",
    )
    report: Mapped["InterviewReport | None"] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
