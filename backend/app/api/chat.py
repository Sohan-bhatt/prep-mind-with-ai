from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, File, ChatMessage
from app.models.schemas import ChatMessageCreate, ChatMessageResponse
from app.agents.chat_agent import ChatAgent
from typing import List

router = APIRouter()

@router.get("/file/{file_id}", response_model=List[ChatMessageResponse])
def get_chat_messages(file_id: str, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.file_id == file_id).order_by(ChatMessage.created_at).all()
    return messages

@router.post("/file/{file_id}", response_model=ChatMessageResponse)
async def send_message(file_id: str, message: ChatMessageCreate, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    user_message = ChatMessage(
        role="user",
        content=message.content,
        file_id=file_id
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    chat_agent = ChatAgent()
    ai_response_text = await chat_agent.chat(message.content, file.content, file_id, db)
    
    assistant_message = ChatMessage(
        role="assistant",
        content=ai_response_text,
        file_id=file_id
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    
    return assistant_message
