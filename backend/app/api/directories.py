from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, Directory
from app.models.schemas import DirectoryCreate, DirectoryResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[DirectoryResponse])
def get_directories(db: Session = Depends(get_db)):
    directories = db.query(Directory).filter(Directory.parent_id == None).all()
    return directories

@router.get("/{directory_id}", response_model=DirectoryResponse)
def get_directory(directory_id: str, db: Session = Depends(get_db)):
    directory = db.query(Directory).filter(Directory.id == directory_id).first()
    if not directory:
        raise HTTPException(status_code=404, detail="Directory not found")
    return directory

@router.post("/", response_model=DirectoryResponse)
def create_directory(directory: DirectoryCreate, db: Session = Depends(get_db)):
    db_directory = Directory(
        name=directory.name,
        parent_id=directory.parent_id
    )
    db.add(db_directory)
    db.commit()
    db.refresh(db_directory)
    return db_directory

@router.put("/{directory_id}", response_model=DirectoryResponse)
def update_directory(directory_id: str, directory: DirectoryCreate, db: Session = Depends(get_db)):
    db_directory = db.query(Directory).filter(Directory.id == directory_id).first()
    if not db_directory:
        raise HTTPException(status_code=404, detail="Directory not found")
    db_directory.name = directory.name
    db_directory.parent_id = directory.parent_id
    db.commit()
    db.refresh(db_directory)
    return db_directory

@router.delete("/{directory_id}")
def delete_directory(directory_id: str, db: Session = Depends(get_db)):
    directory = db.query(Directory).filter(Directory.id == directory_id).first()
    if not directory:
        raise HTTPException(status_code=404, detail="Directory not found")
    db.delete(directory)
    db.commit()
    return {"message": "Directory deleted successfully"}
