import {z} from "zod";

const reportSchema = z.object({
    year: z.coerce.number().int().min(2020).max(2050),
    month: z.coerce.number().int().min(1).max(12)
});
export {reportSchema};