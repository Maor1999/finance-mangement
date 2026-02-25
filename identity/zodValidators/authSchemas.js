import { z } from 'zod';

const addRegisterSchema = z.object({
    fullName: z.string().trim().min(3, 'full name must be at least 3 characters long'),
    password: z.string().min(8, 'password must be at least 8 characters long'),
    email: z.string().trim().email()
});

const addLoginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8, 'password must be at least 8 characters long'),
});

export { addRegisterSchema, addLoginSchema };