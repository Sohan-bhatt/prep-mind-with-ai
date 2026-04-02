import os
import uuid
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.sql import func

load_dotenv()

def _build_database_url() -> str:
    # 1) Prefer DATABASE_URL directly (recommended for production).
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    # 2) Build PostgreSQL URL from discrete env vars when provided.
    pg_user = os.getenv("PGUSER")
    pg_password = os.getenv("PGPASSWORD")
    pg_db = os.getenv("PGDATABASE")
    pg_host = os.getenv("PGHOST")
    pg_port = os.getenv("PGPORT", "5432")
    cloud_sql_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")

    if pg_user and pg_password and pg_db:
        user = quote_plus(pg_user)
        password = quote_plus(pg_password)
        database = quote_plus(pg_db)

        # Cloud Run/App Engine style Unix socket connection.
        if cloud_sql_connection_name:
            socket_path = quote_plus(f"/cloudsql/{cloud_sql_connection_name}")
            return f"postgresql+psycopg://{user}:{password}@/{database}?host={socket_path}"

        # Standard TCP connection (local proxy or public/private IP).
        host = pg_host or "127.0.0.1"
        return f"postgresql+psycopg://{user}:{password}@{host}:{pg_port}/{database}"

    # 3) Local fallback for development.
    return "sqlite:///./dev.db"


DATABASE_URL = _build_database_url()

# Accept sqlite URL variants like `file:./dev.db` from existing env files.
if DATABASE_URL.startswith("file:"):
    DATABASE_URL = DATABASE_URL.replace("file:", "sqlite:///", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Directory(Base):
    __tablename__ = "directories"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    parent_id = Column(String, ForeignKey("directories.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    parent = relationship("Directory", remote_side=[id], back_populates="children")
    children = relationship("Directory", back_populates="parent", cascade="all, delete-orphan")
    files = relationship("File", back_populates="directory", cascade="all, delete-orphan")

class File(Base):
    __tablename__ = "files"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    content = Column(Text, default="")
    directory_id = Column(String, ForeignKey("directories.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    directory = relationship("Directory", back_populates="files")
    notes = relationship("Note", back_populates="file", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="file", cascade="all, delete-orphan")
    revision_notes = relationship("RevisionNote", back_populates="file", cascade="all, delete-orphan")

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    file_id = Column(String, ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    note_type = Column(String, nullable=False)  # IMPORTANT, QNA, ESSAY, REVISION
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    file = relationship("File", back_populates="notes")

class RevisionNote(Base):
    __tablename__ = "revision_notes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    file_id = Column(String, ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    error_type = Column(String, nullable=False)  # CONFUSION, MISTAKE, CONCEPT_MISUNDERSTANDING
    is_resolved = Column(String, default="false")  # true/false
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_reviewed = Column(DateTime(timezone=True), server_default=func.now())
    review_count = Column(String, default="0")
    
    file = relationship("File", back_populates="revision_notes")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    role = Column(String, nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    file_id = Column(String, ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    file = relationship("File", back_populates="chat_messages")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
