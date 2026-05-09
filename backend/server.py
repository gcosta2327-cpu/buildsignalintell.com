from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
import uuid
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an e-commerce demand analyst. Based on the business description provided, return ONLY a valid JSON object with this exact structure:
{
  "summary": "string (2-3 sentence overview)",
  "high_demand": [{"product": "string", "reason": "string", "confidence": "high|medium|low"}],
  "low_demand": [{"product": "string", "reason": "string", "confidence": "high|medium|low"}],
  "seasonality": [{"period": "string", "insight": "string"}],
  "actions": ["string", "string", "string"]
}
Do not invent data. Base all insights on real market trends. Label clearly what is a fact vs trend vs assumption. Return only valid JSON, no markdown fences or extra text."""


class AnalysisRequest(BaseModel):
    niche: str
    products: str
    target_audience: str
    price_range: str
    sales_channels: str


def build_user_prompt(request: AnalysisRequest) -> str:
    return (
        f"Business Description:\n"
        f"Niche: {request.niche}\n"
        f"Products: {request.products}\n"
        f"Target Audience: {request.target_audience}\n"
        f"Price Range: {request.price_range}\n"
        f"Sales Channels: {request.sales_channels}"
    )


def parse_llm_response(raw: str) -> dict:
    cleaned = raw.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Could not parse JSON from AI response")


class AnalysisRecord(BaseModel):
    id: str
    niche: str
    created_at: str
    result: dict


@api_router.get("/")
async def root():
    return {"message": "BuildSignal API running"}


@api_router.post("/analyze")
async def analyze_business(request: AnalysisRequest):
    try:
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")

        chat = LlmChat(
            api_key=llm_key,
            session_id=str(uuid.uuid4()),
            system_message=SYSTEM_PROMPT
        ).with_model("anthropic", "claude-4-sonnet-20250514")

        raw_response = await chat.send_message(UserMessage(text=build_user_prompt(request)))

        try:
            result = parse_llm_response(raw_response)
        except (ValueError, json.JSONDecodeError) as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {e}")

        await db.analyses.insert_one({
            "id": str(uuid.uuid4()),
            "niche": request.niche,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "result": result,
        })

        return {"success": True, "data": result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
