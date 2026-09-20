import "server-only";

import { randomUUID } from "node:crypto";
import postgres from "postgres";
import type { ContactSubmission } from "@/app/contact/contact-submission";

type SqlClient = ReturnType<typeof postgres>;
let client: SqlClient | undefined;

function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for PostgreSQL contact storage.");
  client ??= postgres(process.env.DATABASE_URL, { max: 2, idle_timeout: 5, connect_timeout: 5, prepare: false });
  return client;
}

export async function saveContactSubmission(submission: ContactSubmission) {
  const referenceId = `INS-${randomUUID().slice(0, 8).toUpperCase()}`;
  if (process.env.INSIPS_CONTENT_MODE !== "postgres" || !process.env.DATABASE_URL) {
    console.info("Local contact submission queued", { referenceId, topic: submission.topic });
    return { referenceId, storage: "local" as const };
  }

  const rows = await database()`
    INSERT INTO contact_submissions (topic, email, message)
    VALUES (${submission.topic}, ${submission.email}, ${`Subject: ${submission.subject}\nRelationship: ${submission.relationship}\n\n${submission.message}`})
    RETURNING id
  `;
  return { referenceId, storage: "postgres" as const, id: String(rows[0]?.id ?? referenceId) };
}
