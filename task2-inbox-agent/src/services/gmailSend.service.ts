import type { gmail_v1 } from "googleapis";
import { getGmailClient } from "../auth/googleAuth.js";

function encodeMessage(message: string): string {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<gmail_v1.Schema$Message> {
  const gmail = await getGmailClient();

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodeMessage(message),
    },
  });

  return response.data;
}