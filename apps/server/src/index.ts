import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import twilio from 'twilio';
import axios from 'axios';
import { PrismaClient } from 'database';
import { replyMessage } from 'types';
import { ChatGPTAPI } from 'chatgpt';
// let ChatGPTAPI: any;
// async () => {
//     try {
//         const module = await import('chatgpt');
//         ChatGPTAPI = module.ChatGPTAPI;
//     } catch (error) {
//         console.error('Error importing chatgpt:', error);
//     }
// }

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



console.log(ChatGPTAPI)
const api = new ChatGPTAPI({
    apiKey: OPENAI_API_KEY
});


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors());

app.post('/query', async (req, res) => {
    console.log('\n\n', req.body, '\n\n');



    const response = await axios({
        baseURL: BASEURL,
        url: '/reply',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            to: req.body.From,
            message: 'Hows going'
        }
    })

    return res.status(200).json(req.body);



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

        const { to, message } = parsedInput.data;



        const prompt = await api.sendMessage(message);
        console.log(prompt);

        // Use the Twilio client to send a message
        const response = await client.messages.create({
            body: prompt.text,
            from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
            to: to,
        });

        console.log(`Message sent with SID: ${response.sid}`);
        return res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }

});

app.listen(PORT, () => {
    console.log(`Server Running on Port: ${PORT}`);
});