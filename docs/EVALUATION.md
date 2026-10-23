# Evaluation Plan

This document defines the evaluation cases for the capstone. Results should be filled in only after running the cases; do not claim a result before testing.

## Metrics

For each task, record:

- **Quality:** correctness, relevance, completeness, citation quality
- **Latency:** response time
- **Reliability:** success/failure rate
- **Safety:** unsupported claims, unsafe automatic actions, human approval behavior
- **Cost:** model/API usage where measurable

## Task 1 — Knowledge Brain: 20 cases

| ID | Test case | Expected behavior |
|---|---|---|
| T1-01 | Ask how to change the website logo | Answer from relevant logo documentation with sources |
| T1-02 | Ask how to delete the website logo | Return relevant deletion guidance and source |
| T1-03 | Ask an unrelated question not covered by KB | Say knowledge is insufficient rather than inventing |
| T1-04 | Ask the same question with different wording | Retrieve the same relevant knowledge |
| T1-05 | Ask a question requiring multiple sources | Combine relevant evidence when available |
| T1-06 | Ask for a source URL | Return source metadata |
| T1-07 | Send an empty query | Reject or safely handle invalid input |
| T1-08 | Send a very short query | Handle without crashing |
| T1-09 | Send a long query | Handle within API limits |
| T1-10 | Ask about admin/content management | Retrieve relevant support documentation |
| T1-11 | Ask about a nonexistent feature | Avoid hallucinating a feature |
| T1-12 | Ask with spelling mistakes | Attempt semantic retrieval |
| T1-13 | Ask with extra irrelevant words | Focus retrieval on the useful intent |
| T1-14 | Repeat a query during normal operation | Stable response behavior |
| T1-15 | Query when LLM provider temporarily returns 503 | Retry and return controlled fallback/error behavior |
| T1-16 | Query with no retrieved evidence | Do not fabricate an answer |
| T1-17 | Check source titles in response | Sources contain usable metadata |
| T1-18 | Check source URLs | URLs are present and usable |
| T1-19 | Restart API and query again | Existing vector data remains usable |
| T1-20 | Run a fresh ingestion/update | New/updated knowledge becomes retrievable |

### Task 1 result template

- Passed:
- Failed:
- Pending:
- Average latency:
- Citation correctness:
- Unsupported-answer rate:

## Task 2 — Inbox Agent: 20 cases

| ID | Test case | Expected behavior |
|---|---|---|
| T2-01 | Load inbox drafts | Draft list appears |
| T2-02 | Open a draft | Email and AI answer are shown |
| T2-03 | Approve a draft | Status changes to approved |
| T2-04 | Reject a draft | Status changes to rejected |
| T2-05 | Edit a draft | Updated answer is stored |
| T2-06 | Edit with empty answer | Return validation error |
| T2-07 | Open a missing draft ID | Return 404 |
| T2-08 | Search conversations | Matching conversations remain visible |
| T2-09 | Open source from draft | Source opens in a new tab |
| T2-10 | Start knowledge chat | Chat interface appears |
| T2-11 | Ask a KB question in chat | Task 1 answer and sources appear |
| T2-12 | Ask an unsupported chat question | Show controlled insufficient-knowledge response |
| T2-13 | Task 1 is offline | Show a controlled failure instead of crashing |
| T2-14 | Task 1 temporarily returns 503 | Handle/retry according to service behavior |
| T2-15 | Refresh draft list | Current server state is loaded |
| T2-16 | Approve twice | No unintended duplicate action |
| T2-17 | Reject twice | No unintended duplicate action |
| T2-18 | XSS-like email text | Render escaped text |
| T2-19 | Missing sender/subject | Use safe fallback labels |
| T2-20 | Human escalation action | Clearly communicate that escalation is recorded/needs human follow-up |

### Task 2 result template

- Passed:
- Failed:
- Pending:
- Average UI/API latency:
- Draft correctness:
- Human approval success rate:

## Task 3 — Meeting → Scope: 20 cases

| ID | Test case | Expected behavior |
|---|---|---|
| T3-01 | Basic customer-support website transcript | Extract requirements |
| T3-02 | Transcript with admin requirement | Include admin requirement |
| T3-03 | Transcript requiring knowledge lookup | Call Task 1 |
| T3-04 | Transcript with logo requirement | Retrieve relevant knowledge |
| T3-05 | Unsupported technical request | Mark uncertainty instead of inventing |
| T3-06 | Very short transcript | Return controlled result |
| T3-07 | Long transcript | Extract useful requirements |
| T3-08 | Multiple requirements in one paragraph | Separate requirements |
| T3-09 | Ambiguous requirement | Preserve ambiguity or state assumption |
| T3-10 | Feasible MVP | Mark feasible |
| T3-11 | Clearly over-large request | Identify scope/feasibility concern |
| T3-12 | Task 1 unavailable | Return controlled integration failure |
| T3-13 | Task 1 returns insufficient knowledge | Continue without fabricated knowledge |
| T3-14 | Estimate generation | Return low/high estimate |
| T3-15 | Scope generation | Return implementation scope |
| T3-16 | Proposal generation | Return concise proposal |
| T3-17 | Empty transcript | Validate input |
| T3-18 | Transcript with irrelevant discussion | Focus on project requirements |
| T3-19 | Same transcript twice | Produce stable structure |
| T3-20 | API endpoint test | `/analyze` returns HTTP 200 for valid input |

### Task 3 result template

- Passed:
- Failed:
- Pending:
- Average latency:
- Requirement extraction accuracy:
- Knowledge integration success rate:
- Estimate consistency:

## Evaluation rule

Until a case is actually executed, mark it **Pending**. The capstone should distinguish implementation from measured performance.
