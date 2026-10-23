import type { Email } from "../types/email.js";
import { getGmailClient } from "../auth/googleAuth.js";

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

function findHeader(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  name: string
): string {
  const header = headers?.find(
    (item) => item.name?.toLowerCase() === name.toLowerCase()
  );

  return header?.value ?? "";
}

function extractBody(payload: any): string {
  if (payload?.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (Array.isArray(payload?.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }

      const nestedBody = extractBody(part);

      if (nestedBody) {
        return nestedBody;
      }
    }
  }

  return "";
}

export async function getInboxEmails(): Promise<Email[]> {
  const gmail = await getGmailClient();

  const response = await gmail.users.messages.list({
    userId: "me",
    q: "label:AI_AGENT",
    maxResults: 5,
  });

  const messages = response.data.messages ?? [];

  const emails: Email[] = [];

  for (const message of messages) {
    if (!message.id) {
      continue;
    }

    const messageResponse = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const payload = messageResponse.data.payload;

    const headers = payload?.headers;

    const email: Email = {
      from: findHeader(headers, "From"),
      subject: findHeader(headers, "Subject"),
      body: extractBody(payload),
    };

    emails.push(email);
  }

  return emails;
}