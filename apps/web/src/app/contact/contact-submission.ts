import { z } from "zod";

export const contactRelationships = [
  "Organization",
  "Donor",
  "Volunteer",
  "Corporate or CSR team",
  "Reviewer or admin",
  "Media",
  "Other",
] as const;

export const contactTopics = [
  "Organization onboarding",
  "Donation support",
  "Corporate or CSR enquiry",
  "Verification or document review",
  "Technical support",
  "Media enquiry",
  "Security report",
  "General enquiry",
] as const;

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  relationship: z.enum(contactRelationships),
  topic: z.enum(contactTopics),
  subject: z.string().trim().min(3, "Add a subject.").max(160),
  message: z.string().trim().min(20, "Add a little more detail so we can help.").max(3000),
  consent: z.literal(true, { error: "Please confirm how we may use this information." }),
  website: z.string().max(0).default(""),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

export function normalizeContactSubmission(input: unknown): ContactSubmission {
  const parsed = contactSubmissionSchema.parse(input);
  return { ...parsed, email: parsed.email.toLowerCase() };
}
