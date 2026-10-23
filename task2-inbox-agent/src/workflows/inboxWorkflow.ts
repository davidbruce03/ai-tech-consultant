import { getInboxEmails } from "../services/gmail.service.js";
import { queryKnowledge } from "../services/knowledge.js";
import { saveDraft } from "../stores/draft.store.js";

import type {
  Draft,
  Email,
} from "../types/email.js";

async function processEmail(
  email: Email
): Promise<Draft> {
  const knowledge = await queryKnowledge(email.body);

  return {
    id: crypto.randomUUID(),
    email,
    answer: knowledge.answer,
    sources: knowledge.sources,
    status: "pending",
  };
}

export async function runInboxWorkflow(): Promise<Draft[]> {
  const emails = await getInboxEmails();

  const drafts: Draft[] = [];

  for (const email of emails) {
    if (!email.body.trim()) {
      continue;
    }

    const draft = await processEmail(email);

    saveDraft(draft);
    drafts.push(draft);

    console.log("DRAFT CREATED:");
    console.log(JSON.stringify(draft, null, 2));
  }

  return drafts;
}