from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL, make_url

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    database_path: Path | None = Field(default=None, alias="DATABASE_PATH")
    ollama_base_url: str = Field(
        default="http://localhost:11434",
        alias="OLLAMA_BASE_URL",
    )
    ollama_model: str = Field(default="qwen2.5:3b", alias="OLLAMA_MODEL")
    ollama_timeout_seconds: float = Field(
        default=90,
        gt=0,
        alias="OLLAMA_TIMEOUT_SECONDS",
    )
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        alias="EMBEDDING_MODEL",
    )
    chroma_persist_directory: Path = Field(
        default=BACKEND_DIR / "chroma_db",
        alias="CHROMA_PERSIST_DIRECTORY",
    )
    max_resume_size_bytes: int = Field(
        default=5 * 1024 * 1024,
        gt=0,
        alias="MAX_RESUME_SIZE_BYTES",
    )

    @property
    def sqlalchemy_database_url(self) -> URL:
        if self.database_path is not None:
            path = self._resolve_path(self.database_path)
            return URL.create("sqlite", database=str(path))

        if self.database_url:
            url = make_url(self.database_url)
            if url.get_backend_name() != "sqlite":
                raise ValueError("Only SQLite DATABASE_URL values are supported.")
            if url.database not in (None, "", ":memory:"):
                path = self._resolve_path(Path(url.database))
                return url.set(database=str(path))
            return url

        default_path = BACKEND_DIR / "data" / "candidates.db"
        default_path.parent.mkdir(parents=True, exist_ok=True)
        return URL.create("sqlite", database=str(default_path))

    @property
    def is_sqlite(self) -> bool:
        return self.sqlalchemy_database_url.get_backend_name() == "sqlite"

    def _resolve_path(self, path: Path) -> Path:
        if not path.is_absolute():
            path = BACKEND_DIR / path
        path.parent.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
