from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, Note
from app.models.schemas import NoteCreate, NoteResponse
from typing import List

router = APIRouter()

@router.get("/file/{file_id}", response_model=List[NoteResponse])
def get_notes(file_id: str, note_type: str = None, db: Session = Depends(get_db)):
    query = db.query(Note).filter(Note.file_id == file_id)
    if note_type:
        query = query.filter(Note.note_type == note_type)
    notes = query.all()
    return notes

@router.post("/", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = Note(
        content=note.content,
        file_id=note.file_id,
        note_type=note.note_type
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, note: NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db_note.content = note.content
    db_note.note_type = note.note_type
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}
