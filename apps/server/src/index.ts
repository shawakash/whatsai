import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';


dotenv.config();

const app = express();
const { PORT } = process.env;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors());

app.post('/query', (req, res) => {
    console.log(req);
    return res.status(200).json(req.body);
});

app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hello from server' });
});

app.listen(PORT, () => {
    console.log(`Server Running on Port: ${PORT}`);
});