import "dotenv/config";

import { startServer } from "./api/server";
import { runInboxWorkflow } from "./workflows/inboxWorkflow";

async function main(): Promise<void> {
  startServer();

  await runInboxWorkflow();
}

main().catch((error) => {
  console.error("Inbox Agent failed:", error);
  process.exit(1);
});