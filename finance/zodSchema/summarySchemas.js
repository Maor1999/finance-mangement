import { z } from "zod";

const monthlySummaryParamsSchema = z.object({
year: z.preprocess(
(val) => Number(val),
z.number().int().min(2000).max(2100)
),
month: z.preprocess((val) => Number(val), z.number().int().min(1).max(12)),
});

export { monthlySummaryParamsSchema };