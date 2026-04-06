import { prisma } from "@/lib/prisma";

export interface HCCheckInput {
  recruitmentType: string;
  ventureId: string;
  positionName: string;
  quantity: number;
  planYear: number;
}

export interface HCCheckOutput {
  result: "WITHIN_HC" | "OVER_HC" | "SKIPPED";
  reason: string | null;
}

export async function performHCCheck(input: HCCheckInput): Promise<HCCheckOutput> {
  // REPLACEMENT type => always SKIPPED
  if (input.recruitmentType === "REPLACEMENT") {
    return { result: "SKIPPED", reason: null };
  }

  // NEW type => check headcount plan
  const plans = await prisma.headcountPlan.findMany({
    where: {
      ventureId: input.ventureId,
      year: input.planYear,
      positionName: {
        contains: input.positionName,
      },
    },
  });

  if (plans.length === 0) {
    return {
      result: "OVER_HC",
      reason: `Không tìm thấy kế hoạch HC cho vị trí "${input.positionName}" năm ${input.planYear}`,
    };
  }

  // Find the best matching plan (exact or closest match)
  const plan = plans[0];
  const remaining = plan.plannedHc - plan.usedHc;

  if (input.quantity <= remaining) {
    return { result: "WITHIN_HC", reason: null };
  }

  return {
    result: "OVER_HC",
    reason: `Vượt HC: yêu cầu ${input.quantity}, còn lại ${remaining} (kế hoạch ${plan.plannedHc}, đã dùng ${plan.usedHc})`,
  };
}
