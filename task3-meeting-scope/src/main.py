from fastapi import FastAPI
from pydantic import BaseModel

from src.services.meeting_service import analyze_meeting


app = FastAPI(title="Task 3 Meeting Scope API")


class MeetingRequest(BaseModel):
    transcript: str


@app.get("/")
def health_check():
    return {
        "service": "Task 3 Meeting Scope",
        "status": "running",
    }


@app.post("/analyze")
def analyze(request: MeetingRequest):
    return analyze_meeting(request.transcript)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )
