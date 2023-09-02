import { z } from 'zod';

export const replyRequestType = z.object({
    to: z.string(),
    message: z.string()
});
