import z from 'zod';

export const profileIdSchema = z.string().trim().min(1).max(255);
