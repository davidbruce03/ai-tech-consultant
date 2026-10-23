# AI Tech Consultant

An AI-powered technical consulting capstone built as three connected services:

1. **Task 1 — Knowledge Brain:** centralized web knowledge ingestion, RAG retrieval, citations, and API.
2. **Task 2 — Inbox Agent:** Gmail-based inbox assistant with knowledge-grounded drafts and human approval.
3. **Task 3 — Meeting → Scope:** transcript analysis that produces requirements, feasibility, scope, estimates, and proposals.

The key architectural principle is that **Task 2 and Task 3 use Task 1 through its API instead of implementing their own RAG systems.**

---

## Architecture

```text
                         ┌──────────────────────────┐
                         │        TASK 1             │
                         │     Knowledge Brain       │
                         │                            │
                         │ Web Data → Chunking        │
                         │ → Embeddings → ChromaDB    │
                         │ → Retrieval → AI Answer    │
                         │ → Sources                  │
                         │                            │
                         │ POST /query                │
                         └─────────────┬──────────────┘
                                       │
                         Central Knowledge API
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
          ┌────────────────────┐                ┌────────────────────┐
          │      TASK 2        │                │      TASK 3        │
          │    Inbox Agent     │                │   Meeting → Scope  │
          │                    │                │                    │
          │ Gmail → Email      │                │ Transcript         │
          │       ↓            │                │       ↓            │
          │ Task 1 /query      │                │ Requirements       │
          │       ↓            │                │       ↓            │
          │ AI Draft           │                │ Task 1 /query      │
          │       ↓            │                │       ↓            │
          │ Human Approval     │                │ Feasibility        │
          │ Edit / Reject     │                │       ↓            │
          │                    │                │ Scope / Estimate   │
          └────────────────────┘                │       ↓            │
                                                │ Proposal           │
                                                └────────────────────┘
```

---

# Task 1 — Knowledge Brain

Python-based centralized knowledge service.

### Responsibilities

- Website/content ingestion
- Web scraping
- Document processing
- Chunking
- Embeddings
- Vector database storage
- Retrieval-augmented generation
- Source citations
- Knowledge API

### API

```text
POST /query
```

Example:

```json
{
  "query": "How can I change the website logo?",
  "top_k": 5
}
```

The API returns an answer together with relevant knowledge sources.

### Default URL

```text
http://127.0.0.1:8000
```

---

# Task 2 — Inbox Agent

TypeScript-based email assistant.

### Responsibilities

- Read inbox messages through Gmail
- Send email questions to Task 1
- Generate knowledge-based draft responses
- Store drafts
- Human approval
- Human rejection
- Human editing
- Display knowledge sources
- Knowledge chat interface

### API

```text
GET  /health
GET  /drafts

POST /drafts/:id/approve
POST /drafts/:id/reject
POST /drafts/:id/edit
```

### Frontend

The Task 2 interface provides:

- Inbox/conversation list
- Draft view
- Knowledge chat
- Source display
- Approve action
- Edit action
- Reject action
- Human escalation action

### Default URL

```text
http://127.0.0.1:3000
```

---

# Task 3 — Meeting → Scope

Python-based meeting analysis service.

### Responsibilities

- Accept meeting transcripts
- Extract project requirements
- Query Task 1 for relevant knowledge
- Perform feasibility analysis
- Generate project scope
- Produce effort estimates
- Generate a proposal

### API

```text
POST /analyze
```

Example:

```json
{
  "transcript": "The client needs a customer support website..."
}
```

### Default URL

```text
http://127.0.0.1:8001
```

---

# API Data Flow

## Inbox Workflow

```text
Gmail
  ↓
Task 2 Inbox Agent
  ↓
Extract email question
  ↓
Task 1 /query
  ↓
Knowledge retrieval
  ↓
Answer + sources
  ↓
Draft
  ↓
Human approval / edit / reject
```

## Meeting Workflow

```text
Meeting transcript
  ↓
Task 3 /analyze
  ↓
Requirement extraction
  ↓
Task 1 /query
  ↓
Knowledge + sources
  ↓
Feasibility analysis
  ↓
Scope
  ↓
Estimate
  ↓
Proposal
```

---

# Human-in-the-Loop

Task 2 does not automatically send AI-generated responses.

A generated draft remains under human control and can be:

- Approved
- Edited
- Rejected
- Escalated for human attention

This provides a safety layer between AI-generated content and outgoing communication.

---

# Technology

## Task 1

- Python
- FastAPI
- ChromaDB
- Sentence Transformers
- Requests
- BeautifulSoup
- Google GenAI
- Python dotenv

## Task 2

- TypeScript
- Node.js
- tsx
- Gmail API
- Google authentication
- Native Node HTTP server
- HTML/CSS/JavaScript frontend

## Task 3

- Python
- FastAPI
- Uvicorn
- Requests
- Python dotenv

---

# Running the Project

The three services are designed to run independently.

## 1. Task 1 — Knowledge Brain

```powershell
cd task1-knowledge-brain

.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Start the API using the Task 1 project's configured application entry point.

Default URL:

```text
http://127.0.0.1:8000
```

Task 1 should be running before testing Task 2 or Task 3 because both services consume its API.

---

## 2. Task 2 — Inbox Agent

```powershell
cd task2-inbox-agent

npm install

npx tsx src/index.ts
```

Default URL:

```text
http://127.0.0.1:3000
```

Task 2 uses Task 1 through:

```text
POST http://127.0.0.1:8000/query
```

---

## 3. Task 3 — Meeting → Scope

```powershell
cd task3-meeting-scope

pip install -r requirements.txt

python -m src.main
```

Default URL:

```text
http://127.0.0.1:8001
```

Task 3 uses Task 1 through:

```text
POST http://127.0.0.1:8000/query
```

---

# Environment Variables

Sensitive credentials should be stored in `.env` files and should never be committed to Git.

Example:

```env
TASK1_API=http://127.0.0.1:8000
```

Google authentication credentials are configured locally for the Gmail integration.

---

# Project Structure

```text
ai-tech-consultant/
│
├── task1-knowledge-brain/
│   ├── src/
│   ├── requirements.txt
│   └── .env
│
├── task2-inbox-agent/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── task3-meeting-scope/
│   ├── src/
│   │   ├── main.py
│   │   └── services/
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
└── README.md
```

---

# Current Implementation Status

## Task 1

- Knowledge ingestion — implemented
- Web scraping — implemented
- RAG retrieval — implemented
- Vector database — implemented
- Knowledge API — implemented
- Source citations — implemented

## Task 2

- Gmail inbox integration — implemented
- Task 1 integration — implemented
- Knowledge-based draft generation — implemented
- Draft storage — implemented
- Human approval — implemented
- Human rejection — implemented
- Human editing — implemented
- Knowledge chat — implemented
- Frontend — implemented

## Task 3

- Transcript API — implemented
- Requirement extraction — implemented
- Task 1 integration — implemented
- Feasibility analysis — implemented
- Scope generation — implemented
- Estimation — implemented
- Proposal generation — implemented

---

# Known Limitations

This project is a capstone MVP.

- AI model availability can affect response generation.
- Gmail requires valid Google authentication.
- The three services currently run as separate local processes.
- Task 2 human approval is implemented as an application workflow.
- The escalation action is currently represented in the frontend rather than as a separate persistent escalation service.
- Evaluation datasets and production deployment are outside the current MVP implementation.
- Claude integration was not included because an available Claude API key was not available during implementation.

---

# Design Principle

**Task 1 is the centralized knowledge brain.**

Task 2 and Task 3 consume Task 1 through its API instead of implementing separate retrieval systems.

This keeps knowledge retrieval centralized, reduces duplicated logic, and allows the same knowledge source to support multiple AI workflows.