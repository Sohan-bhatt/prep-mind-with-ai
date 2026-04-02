from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, File
from app.models.schemas import FileCreate, FileUpdate, FileResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[FileResponse])
def get_files(directory_id: str = None, db: Session = Depends(get_db)):
    if directory_id:
        files = db.query(File).filter(File.directory_id == directory_id).all()
    else:
        files = db.query(File).all()
    return files

@router.get("/{file_id}", response_model=FileResponse)
def get_file(file_id: str, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@router.post("/", response_model=FileResponse)
def create_file(file: FileCreate, db: Session = Depends(get_db)):
    db_file = File(
        name=file.name,
        content=file.content,
        directory_id=file.directory_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@router.put("/{file_id}", response_model=FileResponse)
def update_file(file_id: str, file: FileUpdate, db: Session = Depends(get_db)):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    db_file.name = file.name
    db_file.content = file.content
    db.commit()
    db.refresh(db_file)
    return db_file

@router.delete("/{file_id}")
def delete_file(file_id: str, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    db.delete(file)
    db.commit()
    return {"message": "File deleted successfully"}
