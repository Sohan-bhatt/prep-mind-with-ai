import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import directories, files, notes, chat, revision
from app.models.database import engine, Base

app = FastAPI(title="UPSC Learning Hub API", version="1.0.0")


def _parse_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    if configured.strip():
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(directories.router, prefix="/api/directories", tags=["Directories"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(revision.router, prefix="/api/revision", tags=["Revision"])

@app.get("/")
async def root():
    return {"message": "UPSC Learning Hub API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
