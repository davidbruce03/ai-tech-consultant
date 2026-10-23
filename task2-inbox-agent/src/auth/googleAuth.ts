import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { google } from "googleapis";
import open from "open";

const CREDENTIALS_PATH = path.resolve("credentials.json");
const TOKEN_PATH = path.resolve("token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
];

type CredentialsFile = {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
};

export async function getGmailClient() {
  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf-8")
  ) as CredentialsFile;

  const config = credentials.installed;

  if (!config) {
    throw new Error(
      "credentials.json does not contain an installed OAuth client."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    "http://127.0.0.1:3001/oauth2callback"
  );

  // Reuse previously approved token.
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(
      fs.readFileSync(TOKEN_PATH, "utf-8")
    );

    oauth2Client.setCredentials(token);

    return google.gmail({
      version: "v1",
      auth: oauth2Client,
    });
  }

  // First-time authorization.
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("Opening Google authorization page...");

  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(
        request.url ?? "/",
        "http://127.0.0.1:3001"
      );

      if (requestUrl.pathname !== "/oauth2callback") {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const code = requestUrl.searchParams.get("code");

      if (!code) {
        response.writeHead(400);
        response.end("Authorization code missing.");
        return;
      }

      const { tokens } = await oauth2Client.getToken(code);

      oauth2Client.setCredentials(tokens);

      fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify(tokens, null, 2)
      );

      response.writeHead(200, {
        "Content-Type": "text/html",
      });

      response.end(`
        <h2>Google authorization successful.</h2>
        <p>You can close this browser window and return to the terminal.</p>
      `);

      server.close();
    } catch (error) {
      console.error("OAuth callback failed:", error);

      response.writeHead(500);
      response.end("Authorization failed.");

      server.close();
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(3001, "127.0.0.1", resolve);
  });

  await open(authUrl);

  await new Promise<void>((resolve, reject) => {
    server.on("close", () => resolve());
    server.on("error", reject);
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}