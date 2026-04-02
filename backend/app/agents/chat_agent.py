from pydantic_ai import Agent
from typing import List, TypedDict
from dotenv import load_dotenv

load_dotenv()

class ChatState(TypedDict):
    messages: List[str]
    file_content: str
    user_query: str
    response: str

chat_agent = Agent(
    model='gemini-2.5-flash',
    system_prompt="""You are a helpful UPSC exam tutor. 
    Help students understand their study material better.
    When a student makes a mistake or shows confusion, identify it and create a revision note.
    Keep your responses clear and concise for exam preparation."""
)

class ChatAgent:
    def __init__(self):
        self.agent = chat_agent
    
    async def chat(self, user_message: str, file_content: str, file_id: str, db) -> str:
        context = f"""File Content:
{file_content}

The student is studying this material. Provide helpful explanations and answer their questions.
If the student makes a mistake or shows confusion, acknowledge it gently and help them understand."""
        
        result = await self.agent.run(context + f"\n\nStudent Question: {user_message}")
        return result.output
    
    async def extract_confusion_points(self, user_message: str, ai_response: str) -> List[str]:
        prompt = f"""Analyze this conversation and identify any confusion or mistakes the student showed:

User: {user_message}
AI Response: {ai_response}

Return a JSON list of confusion points. If none, return empty list [].
Example: ["Student confused about parliamentary system vs presidential system"]"""
        
        result = await self.agent.run(prompt)
        return result.output
