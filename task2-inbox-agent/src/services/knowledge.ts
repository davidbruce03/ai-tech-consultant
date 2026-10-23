import "dotenv/config";

import type { KnowledgeResponse } from "../types/email.ts";

const TASK1_API =
  process.env.TASK1_API ?? "http://127.0.0.1:8000";

export async function queryKnowledge(
  question: string
): Promise<KnowledgeResponse> {
  const response = await fetch(`${TASK1_API}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: question,
      top_k: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Task 1 API failed: ${response.status}`
    );
  }

  return response.json() as Promise<KnowledgeResponse>;
}