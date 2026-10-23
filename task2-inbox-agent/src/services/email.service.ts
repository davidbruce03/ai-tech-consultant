import type { Email } from "../types/email.js";
import { getGmailClient } from "../auth/googleAuth.js";

export async function getInboxEmails(): Promise<Email[]> {
  const gmail = await getGmailClient();

  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: 5,
  });

  const messages = response.data.messages ?? [];

  const emails: Email[] = [];

  for (const message of messages) {
    if (!message.id) continue;

    const detail = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const headers = detail.data.payload?.headers ?? [];

    const from =
      headers.find((header) => header.name?.toLowerCase() === "from")
        ?.value ?? "";

    const subject =
      headers.find((header) => header.name?.toLowerCase() === "subject")
        ?.value ?? "";

    const body = extractBody(detail.data.payload);

    emails.push({
      from,
      subject,
      body,
    });
  }

  return emails;
}

function extractBody(payload: any): string {
  if (!payload) {
    return "";
  }

  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }

  const parts = payload.parts ?? [];

  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return Buffer.from(part.body.data, "base64url").toString("utf-8");
    }
  }

  for (const part of parts) {
    const nestedBody = extractBody(part);

    if (nestedBody) {
      return nestedBody;
    }
  }

  return "";
}