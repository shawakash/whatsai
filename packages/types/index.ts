import { PrismaClient } from "database";
import { trpcExpress } from "trpc";
import { z } from "zod";

export const replyMessage = z.object({
    message: z.string(),
    to: z.string(),
    prevMessagesId: z.string()
});

export type ReplyMessage = z.infer<typeof replyMessage>;

export enum role {
    User = 'user',
    Assistant = 'assistant',
    System = 'system'
}

export const replyOutput = z.object({
    message: z.string(),
    code: z.number()
});

export type Message = {
    role: string,
    content: string
}

export type ContextType = ({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => {
    id?: number,
    prevMessage: Message[],
    prisma: PrismaClient,
    TWILIO_ACCOUNT_SID: string, 
    TWILIO_AUTH_TOKEN: string, 
    TWILIO_PHONE_NUMBER: string
}