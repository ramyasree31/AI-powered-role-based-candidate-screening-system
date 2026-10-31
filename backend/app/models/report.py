from typing import Any

from sqlalchemy import Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database import Base


class InterviewReport(Base):
    __tablename__ = "interview_reports"

    session_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    questions_answered: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    topic_performance: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    strengths: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    weaknesses: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    recommendations: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    difficulty_progression: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    report_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[str | None] = mapped_column(String, nullable=True)

    session = relationship("InterviewSession", back_populates="report")
