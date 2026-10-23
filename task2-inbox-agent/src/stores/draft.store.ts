import type { Draft } from "../types/email";

const drafts = new Map<string, Draft>();

export function saveDraft(draft: Draft): Draft {
  drafts.set(draft.id, draft);
  return draft;
}

export function getDraft(id: string): Draft | undefined {
  return drafts.get(id);
}

export function listDrafts(): Draft[] {
  return Array.from(drafts.values());
}

export function updateDraft(draft: Draft): Draft {
  drafts.set(draft.id, draft);
  return draft;
}