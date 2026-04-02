from pydantic_ai import Agent
from typing import TypedDict, List
from dotenv import load_dotenv

load_dotenv()

class RevisionState(TypedDict):
    content: str
    error_type: str
    suggestions: List[str]
    summary: str

revision_agent = Agent(
    model='gemini-2.0-flash',
    system_prompt="""You are a learning assistant that helps students identify and learn from their mistakes.
Analyze confusion points and provide categorized error types:
- CONFUSION: Student misunderstood a concept
- MISTAKE: Student made an error in understanding facts
- CONCEPT_MISUNDERSTANDING: Fundamental concept not clear

Provide a brief summary for revision."""
)

class RevisionAgent:
    def __init__(self):
        self.agent = revision_agent
    
    async def detect_error_type(self, content: str) -> str:
        prompt = f"""Analyze this student note and classify the type of error/confusion:

Note: {content}

Return only one word: CONFUSION, MISTAKE, or CONCEPT_MISUNDERSTANDING"""
        
        result = await self.agent.run(prompt)
        return result.output.strip().upper()
    
    async def generate_summary(self, content: str, error_type: str) -> str:
        prompt = f"""Create a brief one-sentence summary of this revision note for quick recall:

Error Type: {error_type}
Note: {content}

Summary:"""
        
        result = await self.agent.run(prompt)
        return result.output.strip()
    
    async def generate_daily_revision(self, notes: List[dict]) -> str:
        notes_text = "\n".join([f"- {n['content'][:100]}..." for n in notes[:5]])
        
        prompt = f"""Create a brief daily revision summary from these confusion points:

{notes_text}

Provide a 3-bullet point summary for today's revision:"""
        
        result = await self.agent.run(prompt)
        return result.output
