import { z } from 'zod';

const decimalAmountSchema = z.preprocess((val) => {
    if (typeof val === "number") return String(val);
    return val;
}, z.string().trim().refine((val) => {
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    return decimalRegex.test(val) && Number(val) > 0;
}, {
    message: 'Amount must be a positive number with up to two decimal places',
}));

const dateTimeInputSchema = z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const normalized = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return `${normalized}T00:00:00.000Z`;
    }
    return normalized;
}, z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: 'Invalid date format',
}));

const createSalarySchema = z.object({
    amount: decimalAmountSchema,
    date: dateTimeInputSchema
});

const updateSalarySchema = z.object({
    amount: decimalAmountSchema.optional(),
    date: dateTimeInputSchema.optional(),
});

const listSalariesQuerySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    skip: z.coerce.number().int().min(0).optional(),
    take: z.coerce.number().int().min(1).max(200).optional(),
});

const salaryIdParamsSchema = z.object({
    salaryId: z.string().uuid(),
});

export { createSalarySchema,
    updateSalarySchema,
    listSalariesQuerySchema, 
    salaryIdParamsSchema 
    };
