from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, RevisionNote
from app.models.schemas import RevisionNoteCreate, RevisionNoteResponse
from app.agents.revision_agent import RevisionAgent
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/file/{file_id}", response_model=List[RevisionNoteResponse])
def get_revision_notes(file_id: str, db: Session = Depends(get_db)):
    notes = db.query(RevisionNote).filter(
        RevisionNote.file_id == file_id,
        RevisionNote.is_resolved == "false"
    ).order_by(RevisionNote.created_at.desc()).all()
    return notes

@router.get("/today", response_model=List[RevisionNoteResponse])
def get_today_revision_notes(db: Session = Depends(get_db)):
    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)
    
    notes = db.query(RevisionNote).filter(
        RevisionNote.is_resolved == "false",
        RevisionNote.created_at >= today,
        RevisionNote.created_at < tomorrow
    ).order_by(RevisionNote.created_at.desc()).all()
    return notes


@router.get("/progress")
def get_progress_stats(db: Session = Depends(get_db)):
    notes = db.query(RevisionNote).all()
    today = datetime.now().date()

    def as_int(value: str | None) -> int:
        try:
            return int(value or "0")
        except ValueError:
            return 0

    total_notes = len(notes)
    resolved_notes = sum(1 for note in notes if note.is_resolved == "true")
    pending_notes = total_notes - resolved_notes
    total_reviews = sum(as_int(note.review_count) for note in notes)
    reviewed_today = sum(
        1
        for note in notes
        if as_int(note.review_count) > 0 and note.last_reviewed and note.last_reviewed.date() == today
    )

    error_breakdown = {
        "CONFUSION": 0,
        "MISTAKE": 0,
        "CONCEPT_MISUNDERSTANDING": 0,
        "OTHER": 0,
    }
    for note in notes:
        if note.error_type in error_breakdown:
            error_breakdown[note.error_type] += 1
        else:
            error_breakdown["OTHER"] += 1

    last_7_days = []
    for day_offset in range(6, -1, -1):
        day = today - timedelta(days=day_offset)
        created_count = sum(1 for note in notes if note.created_at and note.created_at.date() == day)
        reviewed_count = sum(
            1
            for note in notes
            if as_int(note.review_count) > 0 and note.last_reviewed and note.last_reviewed.date() == day
        )
        last_7_days.append(
            {
                "date": day.isoformat(),
                "created": created_count,
                "reviewed": reviewed_count,
            }
        )

    return {
        "total_notes": total_notes,
        "resolved_notes": resolved_notes,
        "pending_notes": pending_notes,
        "resolution_rate": round((resolved_notes / total_notes) * 100, 1) if total_notes else 0.0,
        "total_reviews": total_reviews,
        "average_reviews_per_note": round((total_reviews / total_notes), 2) if total_notes else 0.0,
        "reviewed_today": reviewed_today,
        "error_breakdown": error_breakdown,
        "last_7_days": last_7_days,
    }

@router.get("/pending", response_model=List[RevisionNoteResponse])
def get_pending_revision_notes(db: Session = Depends(get_db)):
    notes = db.query(RevisionNote).filter(
        RevisionNote.is_resolved == "false"
    ).order_by(RevisionNote.last_reviewed.asc()).all()
    return notes

@router.post("/", response_model=RevisionNoteResponse)
async def create_revision_note(note: RevisionNoteCreate, db: Session = Depends(get_db)):
    revision_agent = RevisionAgent()
    
    if not note.error_type or note.error_type == "AUTO_DETECT":
        detected_type = await revision_agent.detect_error_type(note.content)
        note.error_type = detected_type
    
    db_note = RevisionNote(
        content=note.content,
        file_id=note.file_id,
        error_type=note.error_type,
        is_resolved="false",
        review_count="0"
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.put("/{note_id}/resolve", response_model=RevisionNoteResponse)
def resolve_revision_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(RevisionNote).filter(RevisionNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Revision note not found")
    note.is_resolved = "true"
    db.commit()
    db.refresh(note)
    return note

@router.put("/{note_id}/review", response_model=RevisionNoteResponse)
def mark_as_reviewed(note_id: str, db: Session = Depends(get_db)):
    note = db.query(RevisionNote).filter(RevisionNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Revision note not found")
    note.last_reviewed = datetime.now()
    note.review_count = str(int(note.review_count) + 1)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}")
def delete_revision_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(RevisionNote).filter(RevisionNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Revision note not found")
    db.delete(note)
    db.commit()
    return {"message": "Revision note deleted successfully"}
