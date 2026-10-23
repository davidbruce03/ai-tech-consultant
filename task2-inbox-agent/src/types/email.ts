export type Email = {
  from: string;
  subject: string;
  body: string;
};

export type DraftStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "edited";

export type KnowledgeSource = {
  title: string;
  url: string;
  category: string;
  folder: string;
};

export type KnowledgeResponse = {
  query: string;
  answer: string;
  sources: KnowledgeSource[];
};

export type Draft = {
  id: string;
  email: Email;
  answer: string;
  sources: KnowledgeSource[];
  status: DraftStatus;
};