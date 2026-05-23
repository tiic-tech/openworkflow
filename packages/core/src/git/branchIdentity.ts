export type BranchIdentityOperation = "planning" | "select" | "commit" | "resume" | "validate";

export interface BranchIdentityException {
  mode: string | null;
  approved: boolean;
  allowedOperations: string[];
  reason: string | null;
}

export interface BranchIdentityAssessment {
  ok: boolean;
  owns_plan: boolean | null;
  status: "matched" | "mismatched_plan_id" | "unverifiable" | "exception";
  plan_token: string | null;
  branch_token: string | null;
  message: string | null;
  errors: string[];
  warnings: string[];
}

export function assessBranchIdentity(
  planId: string,
  branchBoundary: string | null | undefined,
  exception?: BranchIdentityException | null,
  operation: BranchIdentityOperation = "commit",
): BranchIdentityAssessment {
  const planToken = planIdentityToken(planId);
  const branchToken = branchBoundary ? planIdentityToken(branchBoundary) : null;
  const base = {
    plan_token: planToken,
    branch_token: branchToken,
    message: null,
    errors: [] as string[],
    warnings: [] as string[],
  };

  if (!branchBoundary || !planToken || !branchToken) {
    return {
      ...base,
      ok: true,
      owns_plan: branchBoundary && planToken && !branchToken ? null : null,
      status: "unverifiable",
      message: branchBoundary ? "branch identity is not plan-token verifiable" : "branch boundary is not recorded",
    };
  }

  if (planToken === branchToken) {
    return {
      ...base,
      ok: true,
      owns_plan: true,
      status: "matched",
      message: `branch boundary ${branchBoundary} owns plan ${planId}`,
    };
  }

  const message = `branch identity mismatch: plan ${planId} expects ${planToken}, but branch boundary ${branchBoundary} names ${branchToken}`;
  if (allowsTemporaryContinuation(exception, operation)) {
    return {
      ...base,
      ok: true,
      owns_plan: false,
      status: "exception",
      message,
      warnings: [`${message}; explicit temporary continuation exception is active`],
    };
  }

  return {
    ...base,
    ok: false,
    owns_plan: false,
    status: "mismatched_plan_id",
    message,
    errors: [message],
  };
}

export function branchIdentityExceptionFrom(value: unknown): BranchIdentityException | null {
  if (!isRecord(value)) {
    return null;
  }
  const allowed = Array.isArray(value.allowed_operations)
    ? value.allowed_operations.filter((item): item is string => typeof item === "string")
    : [];
  return {
    mode: typeof value.mode === "string" ? value.mode : null,
    approved: value.approved === true,
    allowedOperations: allowed,
    reason: typeof value.reason === "string" ? value.reason : null,
  };
}

function allowsTemporaryContinuation(exception: BranchIdentityException | null | undefined, operation: BranchIdentityOperation): boolean {
  return Boolean(
    exception?.approved === true
      && exception.mode === "temporary_continuation_branch"
      && exception.allowedOperations.includes(operation),
  );
}

function planIdentityToken(value: string): string | null {
  const match = value.toLowerCase().match(/\bm\d+\b|m\d+(?=[-_])/);
  return match?.[0] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
