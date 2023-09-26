import twilio from 'twilio';
import { notion, publicProcedure, router } from './trpc';
import { ReplyMessage, generateInput, queryBody, replyMessage, replyOutput, role } from 'types';
import { generateMessageArray, getCookie, setCookie, splitMessage } from '../lib/helper';
export * as trpcExpress from '@trpc/server/adapters/express';
import { serialize } from 'cookie';
import axios from 'axios';
import {Client} from "@notionhq/client";
import { pageRouter } from '../routes/notion';

export const notionRouter = notion({
    createPage: publicProcedure
    // .input()
    .mutation(async ({ input, ctx }) => {

        const notion = new Client({ auth: 'secret_yYsjvRT9LMEZCFEMdFY3g8A84SDd5rCTyGr17ARMI1p' });

        const response = await notion.pages.create({
            "cover": {
                "type": "external",
                "external": {
                    "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                }
            },
            "icon": {
                "type": "emoji",
                "emoji": "🥬"
            },
            "parent": {
                "type": "database_id",
                "database_id": "d9824bdc-8445-4327-be8b-5b47500af6ce"
            },
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": "Tuscan kale"
                            }
                        }
                    ]
                },
                "Description": {
                    "rich_text": [
                        {
                            "text": {
                                "content": "A dark green leafy vegetable"
                            }
                        }
                    ]
                },
                "Food group": {
                    "select": {
                        "name": "🥬 Vegetable"
                    }
                }
            },
            "children": [
                {
                    "object": "block",
                    "heading_2": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "Lacinato kale"
                                }
                            }
                        ]
                    }
                },
                {
                    "object": "block",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
                                    "link": {
                                        "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                    }
                                },
                                //@ts-ignore
                                "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
                            }
                        ],
                        "color": "default"
                    }
                }
            ]
        });
        console.log(response);
    })
})

export const appRouter = router({
    reply: publicProcedure
        .input(replyMessage)
        .output(replyOutput)
        .mutation(async ({ ctx, input }) => {
            const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = ctx;
            const { to, message, prevMessagesId } = input;
            console.log(TWILIO_ACCOUNT_SID, 'TWILIO_ACCOUNT_SID')
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
                                id: prevMessagesId
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

        }),
    query: publicProcedure
        .input(queryBody)
        .mutation(async ({ ctx, input }) => {
            console.log('\n\n', input, '\n\n');

            const { ProfileName, WaId, From, AccountSid, SmsMessageSid, MessageSid, Body } = input;

            const from = parseInt(From.split('+')[1]);

            let isUser = await ctx.prisma.user.findUnique({
                where: {
                    Number: from
                }
            });
            // Data object for message
            const data = {
                to: `whatsapp:+${isUser?.Number}`,
                message: '',
                prevMessagesId: ctx.preMessagesId
            }


            if (!isUser) {
                isUser = await ctx.prisma.user.create({
                    data: {
                        ProfileName,
                        WaId,
                        Number: from,
                        AccountSid
                    }
                });

                const messages = await ctx.prisma.messages.create({
                    data: {
                        user: {
                            connect: {
                                id: isUser.id
                            }
                        },
                        messages: {
                            create: {
                                role: role.System,
                                MessageSid: '0000',
                                SmsMessageSid: '0000',
                                body: 'You are a chat generator helper'
                            }
                        }
                    }
                });
                data.prevMessagesId = messages.id;
                ctx.preMessagesId = messages.id;
            }

            // Getting all Messages
            if (!ctx.preMessagesId) {
                const messages = await ctx.prisma.messages.create({
                    data: {
                        user: {
                            connect: {
                                id: isUser.id
                            }
                        },
                        messages: {
                            create: {
                                role: role.System,
                                MessageSid: '0000',
                                SmsMessageSid: '0000',
                                body: 'You are a chat generator helper'
                            }
                        }
                    }
                });
                ctx.preMessagesId = messages.id;
                data.prevMessagesId = messages.id;

            }
            const messages = await ctx.prisma.messages.findUnique({
                where: {
                    id: ctx.preMessagesId
                }
            });

            // checking for commands


            if (Body == '/clear') {
                const messages = await ctx.prisma.messages.create({
                    data: {
                        user: {
                            connect: {
                                id: isUser.id
                            }
                        },
                        messages: {
                            create: {
                                role: role.System,
                                MessageSid: '0000',
                                SmsMessageSid: '0000',
                                body: 'You are a chat generator helper'
                            }
                        }
                    }
                });
                ctx.preMessagesId = messages.id;
                data.prevMessagesId = messages.id;
                data.message = 'Starting a new Converstaion';
                return {
                    data,
                }
            }

            // New Message
            data.message = Body;

            const message = await ctx.prisma.message.create({
                data: {
                    SmsMessageSid,
                    MessageSid,
                    messages: {
                        connect: {
                            id: ctx.preMessagesId
                        }
                    },
                    body: Body,
                    role: role.User
                }
            });

            return {
                data,
            }



        }),
    generate: publicProcedure
        .input(generateInput)
        .mutation(async ({ ctx, input }) => {
            try {

                const { message } = input;

                const prevMessages = await ctx.prisma.messages.findUnique({
                    where: {
                        id: ctx.preMessagesId
                    },
                    include: {
                        messages: {
                            select: {
                                body: true,
                                role: true
                            }
                        }
                    }
                });

                console.log('\n\n', prevMessages, '\n\n')

                if (prevMessages?.messages) {
                    //@ts-ignore  how to store enum type in prisma
                    const messages = generateMessageArray(prevMessages);
                    console.log('\n\n', messages, '\n\n')
                    const prompt = await axios({
                        method: 'POST',
                        baseURL: 'https://api.openai.com/v1/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${ctx.OPENAI_API_KEY}`
                        },
                        data: {
                            model: "gpt-3.5-turbo",
                            messages: messages,
                            temperature: 0.7,
                        }
                    });


                    return {
                        prompt: prompt.data.choices[0].message.content
                    }

                }


            } catch (error) {
                console.log(error);
                return {
                    message: 'Internal Error', error
                }
            }
        }),

    hello: publicProcedure
        .query(async (opts) => {
            return {
                hllo: 'Hello'
            }
        }),
    createPage: publicProcedure
        // .input()
        .mutation(async ({ input, ctx }) => {

            const notion = new Client({ auth: 'secret_yYsjvRT9LMEZCFEMdFY3g8A84SDd5rCTyGr17ARMI1p' });

            const response = await notion.pages.create({
                "cover": {
                    "type": "external",
                    "external": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                    }
                },
                "icon": {
                    "type": "emoji",
                    "emoji": "🥬"
                },
                "parent": {
                    "type": "database_id",
                    "database_id": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                },
                "properties": {
                    "Name": {
                        "title": [
                            {
                                "text": {
                                    "content": "Tuscan kale"
                                }
                            }
                        ]
                    },
                    "Description": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "A dark green leafy vegetable"
                                }
                            }
                        ]
                    },
                    "Food group": {
                        "select": {
                            "name": "🥬 Vegetable"
                        }
                    }
                },
                "children": [
                    {
                        "object": "block",
                        "heading_2": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": "Lacinato kale"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "object": "block",
                        "paragraph": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
                                        "link": {
                                            "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                        }
                                    },
                                    //@ts-ignore
                                    "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                }
                            ],
                            "color": "default"
                        }
                    }
                ]
            });
            console.log(response);
        })
});

// Export type router type signature,
// NOT the router itself.
export type NotionRouter = typeof notionRouter;
export type AppRouter = typeof appRouter;
