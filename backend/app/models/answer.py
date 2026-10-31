from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database import Base


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


class Answer(Base):
    __tablename__ = "interview_answers"

    session_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    question_index: Mapped[int] = mapped_column(Integer, primary_key=True)
    question: Mapped[str] = mapped_column(String, nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    answer: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default=utc_timestamp,
    )

    session = relationship("InterviewSession", back_populates="answers")
    evaluation = relationship(
        "Evaluation",
        back_populates="answer",
        cascade="all, delete-orphan",
        uselist=False,
    )
