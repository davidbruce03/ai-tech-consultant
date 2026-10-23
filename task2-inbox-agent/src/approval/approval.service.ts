import type { Draft, DraftStatus } from "../types/email.js";

export function approveDraft(draft: Draft): Draft {
  return {
    ...draft,
    status: "approved",
  };
}

export function rejectDraft(draft: Draft): Draft {
  return {
    ...draft,
    status: "rejected",
  };
}

export function editDraft(draft: Draft, answer: string): Draft {
  return {
    ...draft,
    answer,
    status: "edited",
  };
}