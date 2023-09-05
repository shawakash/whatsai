import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import twilio from 'twilio';
import axios from 'axios';
import { PrismaClient } from 'database';
import { replyMessage } from 'types';
import OpenAI from 'openai';
import { ChatGPTAPI } from 'chatgpt';
// import { ChatGPTAPIOptions, ChatGPTAPI } from 'chatgpt';


dotenv.config();

const client = new PrismaClient();


const app = express();

const {
    PORT,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    BASEURL,
    OPENAI_API_KEY
} = process.env;

if (!OPENAI_API_KEY) {
    throw new Error("Add the enviorment variable");
}


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
    console.log('\n\n', req.body, '\n\n');

    // api = new ChatGPTAPI({
    //     apiKey: OPENAI_API_KEY,
    // });
    // console.log(api)
    // const prompt = await api.sendMessage(req.body.Body);
    // console.log(prompt.text);




    const response = await axios({
        baseURL: BASEURL,
        url: '/reply',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            to: req.body.From,
            message: req.body.Body
        }
    });

    return res.status(200).json(req.body);
}
);

function splitMessage(text: string, chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

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

        const { to, message } = parsedInput.data;

        // const prompt = await axios({
        //     baseURL: BASEURL,
        //     url: '/start-conversation',
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     data: {
        //         message: message
        //     }
        // });
        // console.log(prompt.data.reply)

        const prompt = await axios({
            method: 'POST',
            baseURL: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            data: {
                model: "gpt-3.5-turbo",
                messages: [{ "role": "user", "content": message }],
                temperature: 0.7
            }
        });
        console.log(prompt.data.choices[0].message.content)
        console.log(typeof prompt.data.choices);


        // const prompt = await api.sendMessage(message);
        // console.log(prompt);

        // Use the Twilio client to send a message
        const responseContent = prompt.data.choices[0].message.content;

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