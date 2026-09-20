import { NextResponse } from "next/server";
import { normalizeContactSubmission } from "@/app/contact/contact-submission";
import { saveContactSubmission } from "@/lib/server/contact-submission-repository";

const recentRequests = new Map<string, { count: number; resetAt: number }>();
const duplicateRequests = new Map<string, { referenceId: string; createdAt: number }>();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "The contact form data was not valid." }, { status: 400 });
  }

  let submission;
  try {
    submission = normalizeContactSubmission(body);
  } catch {
    return NextResponse.json({ message: "Check the required contact fields and try again." }, { status: 400 });
  }

  if (submission.website) {
    return NextResponse.json({ status: "QUEUED", referenceId: "INS-ANTISPAM" }, { status: 202 });
  }

  const now = Date.now();
  const requestKey = submission.email;
  const rate = recentRequests.get(requestKey);
  if (rate && rate.resetAt > now && rate.count >= 3) {
    return NextResponse.json({ message: "Too many messages from this address. Please try again later." }, { status: 429 });
  }
  recentRequests.set(requestKey, rate && rate.resetAt > now ? { count: rate.count + 1, resetAt: rate.resetAt } : { count: 1, resetAt: now + 15 * 60 * 1000 });

  const duplicateKey = `${submission.email}|${submission.subject}|${submission.message}`;
  const duplicate = duplicateRequests.get(duplicateKey);
  if (duplicate && now - duplicate.createdAt < 10 * 60 * 1000) {
    return NextResponse.json({ status: "QUEUED", referenceId: duplicate.referenceId }, { status: 202 });
  }

  try {
    const saved = await saveContactSubmission(submission);
    duplicateRequests.set(duplicateKey, { referenceId: saved.referenceId, createdAt: now });
    return NextResponse.json({ status: "QUEUED", referenceId: saved.referenceId }, { status: 202 });
  } catch (error) {
    console.error("Contact submission could not be persisted.", error);
    return NextResponse.json({ message: "We could not save your message. Please try again shortly." }, { status: 503 });
  }
}
