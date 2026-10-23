# Architecture Notes

## System overview

AI Tech Consultant is a three-task capstone with one centralized knowledge service.

```text
                    ┌─────────────────────────────┐
                    │ Task 1 — Knowledge Brain    │
                    │ Python + FastAPI             │
                    │ Scraping → Chunking →        │
                    │ Embeddings → ChromaDB → RAG │
                    └──────────────┬──────────────┘
                                   │ POST /query
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼─────────┐         ┌─────────▼─────────┐
          │ Task 2            │         │ Task 3            │
          │ Inbox Agent       │         │ Meeting → Scope   │
          │ TypeScript/Node   │         │ Python/FastAPI    │
          └─────────┬─────────┘         └─────────┬─────────┘
                    │                             │
                    ▼                             ▼
             Gmail + Human                 Transcript +
             Approval/Edit                 Requirements +
                                           Feasibility +
                                           Scope + Estimate
```

## Task 1 data flow

**Website → fetcher → parser → chunker → embeddings/vector store → retriever → LLM → `/query` response**

The API returns the generated answer plus source metadata so downstream applications can show citations.

## Task 2 data flow

**Gmail/email input → inbox workflow → Task 1 `/query` → draft store → human approval/edit/reject → optional send**

Task 2 does not implement its own RAG pipeline. It calls Task 1 over HTTP.

The browser frontend talks to the Task 2 server using same-origin requests such as `/drafts` and `/query`. Task 2 then calls Task 1 server-to-server. Therefore CORS is primarily a browser-to-server concern; Task 2 → Task 1 requests made by Node do not require browser CORS headers.

## Task 3 data flow

**Transcript → `/analyze` → requirement extraction → Task 1 `/query` → feasibility → scope → estimate → proposal**

Task 3 also consumes the centralized Task 1 knowledge API rather than duplicating retrieval logic.

## Human-in-the-loop

AI-generated email drafts remain under human control. The reviewer can:

- approve
- edit
- reject
- escalate

This prevents an AI-generated response from becoming an outgoing message without human review.

## Failure handling

- HTTP/API failures should return controlled errors.
- Task 1 LLM calls use retry behavior for temporary provider failures.
- A temporary model `503 UNAVAILABLE` is treated as an external availability problem rather than a RAG failure.
- Missing drafts return `404`.
- Invalid edit requests return `400`.
- Sensitive credentials are excluded by `.gitignore`.

## Ports

| Service | Default |
|---|---:|
| Task 1 Knowledge API | `8000` |
| Task 2 Inbox Agent | `3000` |
| Task 3 Meeting API | `8001` |

## Important design decision

Task 1 is the single source of truth for knowledge retrieval. Task 2 and Task 3 integrate through its API. This avoids duplicated vector databases, embedding logic, prompts, and retrieval code.
