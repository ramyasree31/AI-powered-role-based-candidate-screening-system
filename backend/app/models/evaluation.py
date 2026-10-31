from typing import Any

from sqlalchemy import Boolean, ForeignKeyConstraint, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database import Base


class Evaluation(Base):
    __tablename__ = "answer_evaluations"
    __table_args__ = (
        ForeignKeyConstraint(
            ["session_id", "question_index"],
            ["interview_answers.session_id", "interview_answers.question_index"],
            ondelete="CASCADE",
        ),
    )

    session_id: Mapped[str] = mapped_column(String, primary_key=True)
    question_index: Mapped[int] = mapped_column(Integer, primary_key=True)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    strengths: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    gaps: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    feedback: Mapped[str | None] = mapped_column(String, nullable=True)
    evaluation_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="pending",
    )
    is_ai_evaluated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    raw_result: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    answer = relationship("Answer", back_populates="evaluation")
