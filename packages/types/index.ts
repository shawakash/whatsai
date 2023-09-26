import { PrismaClient } from "database";
import { trpcExpress } from "trpc";
import { z } from "zod";

export const replyMessage = z.object({
    message: z.string(),
    to: z.string(),
    prevMessagesId: z.number()
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
    res
  }: trpcExpress.CreateExpressContextOptions) => {
    id?: number,
    prevMessage: Message[],
    prisma: PrismaClient,
    TWILIO_ACCOUNT_SID: string, 
    TWILIO_AUTH_TOKEN: string, 
    TWILIO_PHONE_NUMBER: string,
    OPENAI_API_KEY: string
    preMessagesId: number,
}

export const queryBody = z.object({
    SmsMessageSid: z.string(),
    NumMedia: z.string(),
    ProfileName: z.string(),
    SmsSid: z.string(),
    WaId: z.string(),
    SmsStatus: z.string(),
    Body: z.string(),
    To: z.string(),
    NumSegments: z.string(),
    ReferralNumMedia: z.string(),
    MessageSid: z.string(),
    AccountSid: z.string(),
    From: z.string(),
    ApiVersion: z.string(),
  });

export const generateInput = z.object({
    message: z.string()
});

export type NotionContextType = {
    prisma: PrismaClient
}

export const createPageRequest = z.object({
    database_url: z.string(),
    api_key: z.string(),
});

export const retrieveDbRequest = z.object({
    database_url: z.string(),
    api_key: z.string(),
});

const CoverType = z.enum(['internal', 'external']);
  
const titleSchema = z.array(
    z.object({
        type: z.literal("text").nullable(),
        text: z.object({
            content: z.string().nullable(),
            link: z.nullable(z.unknown()), // You might want to adjust this type according to your needs
        }),
    })
);

export const createDbRequest = z.object({ 
    api_key: z.string(),
    page_url: z.string(),
    emoji: z.string().nullable(),
    cover: z.object({
        type: CoverType,
        url: z.string()
    }).nullable(),
    title: titleSchema.nullable()
});
