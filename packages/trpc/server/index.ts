import twilio from 'twilio';
import { publicProcedure, router } from './trpc';
import { replyMessage, replyOutput, role } from 'types';
import { splitMessage } from '../lib/helper';
export * as trpcExpress from '@trpc/server/adapters/express';


export const appRouter = router({
    reply: publicProcedure
    .input(replyMessage)
    .output(replyOutput)
    .mutation(async ({ ctx, input }) => {
            const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = ctx;
            const { to, message, prevMessagesId } = input;
            console.log(TWILIO_ACCOUNT_SID)
            const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
            // Use the Twilio client to send a message
            const responseContent = message;

            // Split the response into smaller chunks
            const responseChunks = splitMessage(responseContent, 1599); // Adjust chunkSize as needed

            // Send each chunk as a separate WhatsApp message
            for (const chunk of responseChunks) {
                const response = await client.messages.create({
                    body: chunk,
                    from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
                    to: to,
                });
                console.log(`Message sent with SID: ${response.sid}`);
                console.log('\n\n', response, '\n\n')
                const newMsg = await ctx.prisma.message.create({
                    data: {
                        SmsMessageSid: response.sid,
                        MessageSid: response.sid,
                        messages: {
                            connect: {
                                id: parseInt(prevMessagesId)
                            }
                        },
                        body: chunk,
                        role: role.Assistant
                    }
                });
            }

            return {
                message: 'Sent Successfully',
                code: 200
            }

        })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
