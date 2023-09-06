var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var dbClient = new PrismaClient();
var app = express();
var _a = process.env, PORT = _a.PORT, TWILIO_ACCOUNT_SID = _a.TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN = _a.TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER = _a.TWILIO_PHONE_NUMBER, BASEURL = _a.BASEURL, OPENAI_API_KEY = _a.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error("Add the enviorment variable");
}
var api;
api = new ChatGPTAPI({
    apiKey: OPENAI_API_KEY
});
// Ensure that the 'chatgpt' module is imported correctly
var openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.post('/query', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ProfileName, WaId, From, AccountSid, from, isUser, user, prompt, response, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                console.log('\n\n', req.body, '\n\n');
                _a = req.body, ProfileName = _a.ProfileName, WaId = _a.WaId, From = _a.From, AccountSid = _a.AccountSid;
                from = parseInt(From.split('+')[1]);
                return [4 /*yield*/, dbClient.user.findUnique({
                        where: {
                            Number: from
                        }
                    })];
            case 1:
                isUser = _b.sent();
                if (!!isUser) return [3 /*break*/, 3];
                return [4 /*yield*/, dbClient.user.create({
                        data: {
                            ProfileName: ProfileName,
                            WaId: WaId,
                            Number: from,
                            AccountSid: AccountSid
                        }
                    })];
            case 2:
                user = _b.sent();
                _b.label = 3;
            case 3:
                // api = new ChatGPTAPI({
                //     apiKey: OPENAI_API_KEY,
                // });
                console.log(api);
                return [4 /*yield*/, api.sendMessage(req.body.Body)];
            case 4:
                prompt = _b.sent();
                console.log(prompt.text);
                return [4 /*yield*/, axios({
                        baseURL: BASEURL,
                        url: '/reply',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            to: "whatsapp:+".concat(isUser === null || isUser === void 0 ? void 0 : isUser.Number),
                            message: req.body.Body
                        }
                    })];
            case 5:
                response = _b.sent();
                return [2 /*return*/, res.status(200).json(req.body)];
            case 6:
                error_1 = _b.sent();
                console.log(error_1);
                return [2 /*return*/, res.status(500).json({ message: 'Internal Error', error: error_1 })];
            case 7: return [2 /*return*/];
        }
    });
}); });
function splitMessage(text, chunkSize) {
    var chunks = [];
    for (var i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}
app.get('/', function (req, res) {
    return res.status(200).json({ message: 'Hello from server' });
});
app.post('/reply', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, parsedInput, _a, to, message, prompt, responseContent, responseChunks, _i, responseChunks_1, chunk, response, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
                parsedInput = replyMessage.safeParse(req.body);
                if (!parsedInput.success) {
                    console.log('Validation Error');
                    return [2 /*return*/, res.status(400).json({ message: 'Validation Error' })];
                }
                _a = parsedInput.data, to = _a.to, message = _a.message;
                return [4 /*yield*/, axios({
                        method: 'POST',
                        baseURL: 'https://api.openai.com/v1/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer ".concat(OPENAI_API_KEY)
                        },
                        data: {
                            model: "gpt-3.5-turbo",
                            messages: [{ "role": "user", "content": message }],
                            temperature: 0.7,
                        }
                    })];
            case 1:
                prompt = _b.sent();
                console.log('\n\n', prompt.data, '\n\n');
                console.log(prompt.data.choices[0].message.content);
                console.log(typeof prompt.data.choices);
                responseContent = prompt.data.choices[0].message.content;
                responseChunks = splitMessage(responseContent, 1599);
                _i = 0, responseChunks_1 = responseChunks;
                _b.label = 2;
            case 2:
                if (!(_i < responseChunks_1.length)) return [3 /*break*/, 5];
                chunk = responseChunks_1[_i];
                return [4 /*yield*/, client.messages.create({
                        body: chunk,
                        from: "whatsapp:".concat(TWILIO_PHONE_NUMBER),
                        to: to,
                    })];
            case 3:
                response = _b.sent();
                console.log("Message sent with SID: ".concat(response.sid));
                console.log('\n\n', response.body, '\n\n');
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, res.status(200).json({ message: 'Message sent successfully' })];
            case 6:
                error_2 = _b.sent();
                console.error('Error sending message:', error_2);
                return [2 /*return*/, res.status(500).json({ error: 'Failed to send message' })];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.get('/chat-begin', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var completion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, openai.chat.completions.create({
                    messages: [{ role: 'user', content: 'Say this is a test' }],
                    model: 'gpt-3.5-turbo',
                })];
            case 1:
                completion = _a.sent();
                console.log(completion.choices);
                return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("Server Running on Port: ".concat(PORT));
});
