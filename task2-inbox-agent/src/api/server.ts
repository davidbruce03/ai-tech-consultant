import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  approveDraft,
  rejectDraft,
  editDraft,
} from "../approval/approval.service";

import {
  getDraft,
  listDrafts,
  updateDraft,
} from "../stores/draft.store";

const PORT = Number(process.env.PORT ?? 3000);
const TASK1_API =
  process.env.TASK1_API ?? "http://127.0.0.1:8000";

function sendJson(
  response: any,
  statusCode: number,
  data: unknown
): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  response.end(JSON.stringify(data, null, 2));
}

async function readBody(request: any): Promise<any> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

async function serveFrontend(
  response: any,
  fileName: string
): Promise<void> {
  const filePath = path.join(
    process.cwd(),
    "public",
    fileName
  );

  const content = await readFile(filePath);

  const contentTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
  };

  const extension = path.extname(fileName);

  response.writeHead(200, {
    "Content-Type":
      contentTypes[extension] ?? "text/plain",
  });

  response.end(content);
}

export function startServer(): void {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host ?? "localhost"}`
      );

      // Frontend
      if (
        request.method === "GET" &&
        url.pathname === "/"
      ) {
        await serveFrontend(response, "index.html");
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/style.css"
      ) {
        await serveFrontend(response, "style.css");
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/app.js"
      ) {
        await serveFrontend(response, "app.js");
        return;
      }

      // Health check
      if (
        request.method === "GET" &&
        url.pathname === "/health"
      ) {
        sendJson(response, 200, {
          status: "ok",
          service: "task2-inbox-agent",
        });

        return;
      }

      // Get all drafts
      if (
        request.method === "GET" &&
        url.pathname === "/drafts"
      ) {
        sendJson(response, 200, {
          drafts: listDrafts(),
        });

        return;
      }

      // Send question to Task 1
      if (
        request.method === "POST" &&
        url.pathname === "/query"
      ) {
        const body = await readBody(request);

        if (
          typeof body.query !== "string" ||
          body.query.trim().length === 0
        ) {
          sendJson(response, 400, {
            error: "query is required",
          });

          return;
        }

        const task1Response = await fetch(
          `${TASK1_API}/query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: body.query,
              top_k: 5,
            }),
          }
        );

        if (!task1Response.ok) {
          sendJson(response, 502, {
            error: "Task 1 API failed",
            status: task1Response.status,
          });

          return;
        }

        const data = await task1Response.json();

        sendJson(response, 200, data);

        return;
      }

      // Approval actions
      const match = url.pathname.match(
        /^\/drafts\/([^/]+)\/(approve|reject|edit)$/
      );

      if (request.method === "POST" && match) {
        const draftId = match[1];
        const action = match[2];

        const draft = getDraft(draftId);

        if (!draft) {
          sendJson(response, 404, {
            error: "Draft not found",
          });

          return;
        }

        if (action === "approve") {
          const updatedDraft = approveDraft(draft);

          updateDraft(updatedDraft);

          sendJson(response, 200, {
            message: "Draft approved",
            draft: updatedDraft,
          });

          return;
        }

        if (action === "reject") {
          const updatedDraft = rejectDraft(draft);

          updateDraft(updatedDraft);

          sendJson(response, 200, {
            message: "Draft rejected",
            draft: updatedDraft,
          });

          return;
        }

        if (action === "edit") {
          const body = await readBody(request);

          if (
            typeof body.answer !== "string" ||
            body.answer.trim().length === 0
          ) {
            sendJson(response, 400, {
              error: "answer is required",
            });

            return;
          }

          const updatedDraft = editDraft(
            draft,
            body.answer
          );

          updateDraft(updatedDraft);

          sendJson(response, 200, {
            message: "Draft edited",
            draft: updatedDraft,
          });

          return;
        }
      }

      sendJson(response, 404, {
        error: "Route not found",
      });
    } catch (error) {
      console.error("API error:", error);

      sendJson(response, 500, {
        error: "Internal server error",
      });
    }
  });

  server.listen(PORT, () => {
    console.log(
      `Task 2 API running at http://127.0.0.1:${PORT}`
    );
  });
}
