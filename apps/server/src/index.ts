import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import twilio from 'twilio';
import axios, { AxiosResponse } from 'axios';
import { PrismaClient } from 'database';
import { ReplyMessage, replyMessage, role } from 'types';
import OpenAI from 'openai';
import { ChatGPTAPI } from 'chatgpt';
import { trpcExpress, appRouter, createExpressMiddleware } from 'trpc'
import { getCookie, setCookie } from 'trpc/lib/helper';
// import { ChatGPTAPIOptions, ChatGPTAPI } from 'chatgpt';


dotenv.config();

const dbClient = new PrismaClient();


const app = express();
const {
    PORT,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    BASEURL,
    OPENAI_API_KEY,
} = process.env;

if (!OPENAI_API_KEY) {
    throw new Error("Add the enviorment variable");
}

let preMessageId;

app.use(
    '/trpc',
    createExpressMiddleware(
        TWILIO_ACCOUNT_SID || '', 
        TWILIO_AUTH_TOKEN || '', 
        TWILIO_PHONE_NUMBER || '',
    )
);  
  

let api: any;


// Ensure that the 'chatgpt' module is imported correctly



const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors());

app.post('/query', async (req, res) => {
    try {

        const queryRes = await axios({
            baseURL: BASEURL,
            url: '/trpc/query',
            data: req.body,
            headers: { 
                "Content-Type": 'application/json',
                "preMessagesId": getCookie(req, 'preMessagesId')
            },
            method: 'POST'
        });
    
        preMessageId = queryRes.data.result.data.data.prevMessagesId;
        
        if(preMessageId != getCookie(req, 'preMessagesId')) {
            res.setHeader('Set-Cookie', setCookie('preMessagesId', preMessageId));
        }


        // let data: ReplyMessage;

        // if (req.body.Body == '/clear') {
        //     data = {
        //         to: `whatsapp:+${isUser?.Number}`,
        //         message: 'Starting New Conversation',
        //         prevMessagesId: prevMessagesId?.toString() || ""
        //     }
        // } else {
        //     const prompt = await axios({
        //         baseURL: BASEURL,
        //         url: '/generate',
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         data: {
        //             prevMessagesId,
        //             message: req.body.Body
        //         }
        //     });
        //     console.log(prompt.data.prompt);

        //     data = {
        //         to: `whatsapp:+${isUser?.Number}`,
        //         message: prompt.data.prompt,
        //         prevMessagesId: prevMessagesId?.toString() || ""
        //     }
        // }

        // const response = await axios({
        //     baseURL: BASEURL,
        //     url: '/trpc/reply',
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     data
        // });

        return res.status(200).json(req.body);
    } catch (error) {
        //@ts-ignore
        console.log(error.response.data)
        return res.status(500).json({ message: 'Internal Error', error })
    }
});

function splitMessage(text: string, chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

const generateMessageArray = (prev: ({ messages: { body: string; role: role; }[]; }), message: string) => {
    const result = prev.messages.map((mess: { body: string; role: role }) => ({
        content: mess.body,
        role: mess.role
    }));
    result.push({ role: role.User, content: message });
    return result;
}

app.post('/generate', async (req, res) => {
    try {

        const { prevMessagesId, message } = req.body;

        const prevMessages = await dbClient.messages.findUnique({
            where: {
                id: prevMessagesId
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
            const messages = generateMessageArray(prevMessages, message);
            console.log('\n\n', messages, '\n\n')
            const prompt = await axios({
                method: 'POST',
                baseURL: 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                data: {
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    temperature: 0.7,
                }
            });


            return res.status(200).json({ prompt: prompt.data.choices[0].message.content })

        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Error', error });
    }
});


app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hello from server' });
});

app.post('/reply', async (req, res) => {

    try {
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        const parsedInput = replyMessage.safeParse(req.body);
        if (!parsedInput.success) {
            console.log('Validation Error');
            return res.status(400).json({ message: 'Validation Error' })
        }

        const { to, message, prevMessagesId } = parsedInput.data;

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
            const newMsg = await dbClient.message.create({
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


        return res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }

});


app.get('/chat-begin', async (req, res) => {
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Say this is a test' }],
        model: 'gpt-3.5-turbo',
    });

    console.log(completion.choices);
});



app.listen(PORT, () => {
    console.log(`Server Running on Port: ${PORT}`);
});