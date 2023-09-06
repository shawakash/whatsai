import { z } from "zod";

export const replyMessage = z.object({
    message : z.string(),
    to: z.string(),
    prevMessagesId: z.string()
});

export type ReplyMessage = z.infer<typeof replyMessage>;

export enum role {
    User = 'user',
    Assistant = 'assistant'
}