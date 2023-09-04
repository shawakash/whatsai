import { z } from "zod";

export const replyMessage = z.object({
    message : z.string(),
    to: z.string(),
});

export type ReplyMessage = z.infer<typeof replyMessage>;