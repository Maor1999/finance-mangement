import { z }  from 'zod';

const expenseCategories = z.enum(["FOOD", "ARNONA", "RENT", "OTHER"]);

const normalizedExpenseCategorySchema = z.preprocess((val) => {
  if (typeof val === "string") return val.trim().toUpperCase();
  return val;
}, expenseCategories);

const decimalAmountSchema = z.preprocess((val) => {
  if (typeof val === "number") return String(val);
  return val;
}, z.string().trim().refine(
  (val) => {
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    return decimalRegex.test(val) && Number(val) > 0;
  },
  {
    message: "Amount must be a positive number with up to 2 decimal places",
  }
));

const dateTimeInputSchema = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  const normalized = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return `${normalized}T00:00:00.000Z`;
  }
  return normalized;
}, z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  {
    message: "Invalid date format",
  }
));

const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: normalizedExpenseCategorySchema,
  amount: decimalAmountSchema,
  date: dateTimeInputSchema,
});

const updateExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  category: normalizedExpenseCategorySchema.optional(),
  amount: decimalAmountSchema.optional(),
  date: dateTimeInputSchema.optional(),
});

const listExpensesQuerySchema = z.object({
  from: z.string().optional(), 
  to: z.string().optional(),

  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(200).optional(),
});

const expenseIdParamsSchema = z.object({
  expenseId: z.string().uuid(),
});


export {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
  expenseIdParamsSchema,
};
