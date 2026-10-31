from typing import Any

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database import Base


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    session_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    skills: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    technologies: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    domains: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    projects: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    education: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    experience: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    seniority_level: Mapped[str | None] = mapped_column(String, nullable=True)
    extraction_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="pending",
    )

    session = relationship("InterviewSession", back_populates="candidate_profile")
