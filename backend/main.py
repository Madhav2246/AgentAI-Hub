import os
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from dotenv import load_dotenv
import urllib.request
import urllib.error

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="AgentHub AI API", version="1.0.0")

# Allow CORS for development (Vite server on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "db.json"

# In-memory fallback if file doesn't exist
DEFAULT_DB = {
    "agents": [],
    "tasks": [],
    "workflows": [],
    "knowledge": []
}

def load_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump(DEFAULT_DB, f, indent=2)
        return DEFAULT_DB
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_DB

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.get("/api/status")
def get_status():
    return {
        "status": "online",
        "system": "AgentHub AI Operating System",
        "version": "1.0.0",
        "engine": "LangGraph Python Core"
    }

@app.get("/api/config")
def get_config():
    # Returns whether the backend has a Gemini API key configured
    key = os.environ.get("GEMINI_API_KEY")
    return {
        "hasGeminiKey": bool(key) and key != "YOUR_GEMINI_API_KEY"
    }

@app.get("/api/db")
def get_complete_db():
    return load_db()

@app.post("/api/db/sync")
def sync_db(payload: Dict[str, Any] = Body(...)):
    db = load_db()
    if "agents" in payload:
        db["agents"] = payload["agents"]
    if "tasks" in payload:
        db["tasks"] = payload["tasks"]
    if "workflows" in payload:
        db["workflows"] = payload["workflows"]
    if "knowledge" in payload:
        db["knowledge"] = payload["knowledge"]
    save_db(db)
    return {"status": "success", "message": "Database sync completed."}

# Proxy endpoint for Gemini to use the backend's API key
@app.post("/api/proxy/gemini")
async def proxy_gemini(payload: Dict[str, Any] = Body(...)):
    key = os.environ.get("GEMINI_API_KEY")
    if not key or key == "YOUR_GEMINI_API_KEY":
        raise HTTPException(
            status_code=400, 
            detail="Gemini API Key is not configured on the backend. Please set GEMINI_API_KEY in the backend/.env file."
        )

    model = payload.get("model", "gemini-1.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload.get("body")).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
            return response_data
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        raise HTTPException(status_code=e.code, detail=f"Gemini API Error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Proxy endpoints for other models if needed
@app.post("/api/proxy/openai")
async def proxy_openai(payload: Dict[str, Any] = Body(...), api_key: str = Body(...)):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
            return response_data
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        raise HTTPException(status_code=e.code, detail=f"OpenAI API Error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/proxy/anthropic")
async def proxy_anthropic(payload: Dict[str, Any] = Body(...), api_key: str = Body(...)):
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
            return response_data
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        raise HTTPException(status_code=e.code, detail=f"Anthropic API Error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
