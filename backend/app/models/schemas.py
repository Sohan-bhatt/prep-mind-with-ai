from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DirectoryBase(BaseModel):
    name: str
    parent_id: Optional[str] = None

class DirectoryCreate(DirectoryBase):
    pass

class DirectoryResponse(DirectoryBase):
    id: str
    created_at: datetime
    updated_at: datetime
    children: List["DirectoryResponse"] = []
    files: List["FileResponse"] = []

    class Config:
        from_attributes = True

class FileBase(BaseModel):
    name: str
    content: str = ""

class FileCreate(FileBase):
    directory_id: str

class FileUpdate(FileBase):
    pass

class FileResponse(FileBase):
    id: str
    directory_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NoteBase(BaseModel):
    content: str
    note_type: str

class NoteCreate(NoteBase):
    file_id: str

class NoteResponse(NoteBase):
    id: str
    file_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RevisionNoteBase(BaseModel):
    content: str
    error_type: str  # CONFUSION, MISTAKE, CONCEPT_MISUNDERSTANDING

class RevisionNoteCreate(RevisionNoteBase):
    file_id: str

class RevisionNoteResponse(RevisionNoteBase):
    id: str
    file_id: str
    is_resolved: str
    created_at: datetime
    last_reviewed: datetime
    review_count: str

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: str
    role: str
    file_id: str
    created_at: datetime

    class Config:
        from_attributes = True
