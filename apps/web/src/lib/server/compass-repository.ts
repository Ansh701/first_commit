import type { CandidateClaim } from "@insips/contracts";
import { candidateClaims } from "@/lib/demo-data";

export async function getCompassCandidateClaims(): Promise<CandidateClaim[]> {
  return candidateClaims;
}
