import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import twilio from 'twilio';
import axios from 'axios';
// import { replyRequestType } from "zodTypes";


dotenv.config();

const app = express();

const {
    PORT,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    BASEURL
} = process.env;

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

        // const parsedInput = replyRequestType.safeParse(req.body);
        // if(!parsedInput.success) {
        //     console.log('Validation Error');
        //     return res.status(400).json({ message: 'Validation Error' })
        // }
        
        const { to, message } = req.body;


        // Use the Twilio client to send a message
        const response = await client.messages.create({
            body: message,
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