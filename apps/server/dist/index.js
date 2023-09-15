"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var twilio_1 = __importDefault(require("twilio"));
var axios_1 = __importDefault(require("axios"));
var database_1 = require("database");
var types_1 = require("types");
var openai_1 = __importDefault(require("openai"));
var trpc_1 = require("trpc");
// import { ChatGPTAPIOptions, ChatGPTAPI } from 'chatgpt';
dotenv_1.default.config();
var dbClient = new database_1.PrismaClient();
var app = (0, express_1.default)();
var _a = process.env, PORT = _a.PORT, TWILIO_ACCOUNT_SID = _a.TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN = _a.TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER = _a.TWILIO_PHONE_NUMBER, BASEURL = _a.BASEURL, OPENAI_API_KEY = _a.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error("Add the enviorment variable");
}
app.use('/trpc', trpc_1.trpcExpress.createExpressMiddleware({
    router: trpc_1.appRouter,
    createContext: function (_a) {
        var req = _a.req, res = _a.res;
        return {
            TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID || '',
            TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN || '',
            TWILIO_PHONE_NUMBER: TWILIO_PHONE_NUMBER || '',
            prisma: new database_1.PrismaClient(),
            prevMessage: [
                { role: types_1.role.System, content: 'You are a chat generator' }
            ]
        };
    },
}));
var api;
// Ensure that the 'chatgpt' module is imported correctly
var openai = new openai_1.default({
    apiKey: OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});
app.use(body_parser_1.default.urlencoded({
    extended: true
}));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.post('/query', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ProfileName, WaId, From, AccountSid, SmsMessageSid, MessageSid, from, isUser, prevMessagesId, pre, messages, newMsg, data, prompt, response, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 12, , 13]);
                console.log('\n\n', req.body, '\n\n');
                _a = req.body, ProfileName = _a.ProfileName, WaId = _a.WaId, From = _a.From, AccountSid = _a.AccountSid, SmsMessageSid = _a.SmsMessageSid, MessageSid = _a.MessageSid;
                from = parseInt(From.split('+')[1]);
                return [4 /*yield*/, dbClient.user.findUnique({
                        where: {
                            Number: from
                        }
                    })];
            case 1:
                isUser = _b.sent();
                prevMessagesId = void 0;
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
                isUser = _b.sent();
                _b.label = 3;
            case 3: return [4 /*yield*/, dbClient.messages.findFirst({
                    where: {
                        userId: isUser === null || isUser === void 0 ? void 0 : isUser.id
                    },
                    select: {
                        id: true
                    }
                })];
            case 4:
                pre = _b.sent();
                if (pre) {
                    prevMessagesId = pre.id;
                }
                if (!(!pre || req.body.Body == '/clear')) return [3 /*break*/, 6];
                return [4 /*yield*/, dbClient.messages.create({
                        data: {
                            user: {
                                connect: {
                                    id: isUser.id
                                }
                            },
                            messages: {
                                create: {
                                    role: types_1.role.System,
                                    MessageSid: '0000',
                                    SmsMessageSid: '0000',
                                    body: 'You are a chat generator helper'
                                }
                            }
                        }
                    })];
            case 5:
                messages = _b.sent();
                prevMessagesId = messages.id;
                _b.label = 6;
            case 6: return [4 /*yield*/, dbClient.message.create({
                    data: {
                        SmsMessageSid: SmsMessageSid,
                        MessageSid: MessageSid,
                        messages: {
                            connect: {
                                id: prevMessagesId
                            }
                        },
                        body: req.body.Body,
                        role: types_1.role.User
                    }
                })];
            case 7:
                newMsg = _b.sent();
                // api = new ChatGPTAPI({
                //     apiKey: OPENAI_API_KEY,
                // });
                // console.log(api)
                // const prompt = await api.sendMessage(req.body.Body);
                // console.log(prompt.text);
                console.log('\n\n', prevMessagesId, '\n\n');
                data = void 0;
                if (!(req.body.Body == '/clear')) return [3 /*break*/, 8];
                data = {
                    to: "whatsapp:+".concat(isUser === null || isUser === void 0 ? void 0 : isUser.Number),
                    message: 'Starting New Conversation',
                    prevMessagesId: (prevMessagesId === null || prevMessagesId === void 0 ? void 0 : prevMessagesId.toString()) || ""
                };
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, (0, axios_1.default)({
                    baseURL: BASEURL,
                    url: '/generate',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        prevMessagesId: prevMessagesId,
                        message: req.body.Body
                    }
                })];
            case 9:
                prompt = _b.sent();
                console.log(prompt.data.prompt);
                data = {
                    to: "whatsapp:+".concat(isUser === null || isUser === void 0 ? void 0 : isUser.Number),
                    message: prompt.data.prompt,
                    prevMessagesId: (prevMessagesId === null || prevMessagesId === void 0 ? void 0 : prevMessagesId.toString()) || ""
                };
                _b.label = 10;
            case 10: return [4 /*yield*/, (0, axios_1.default)({
                    baseURL: BASEURL,
                    url: '/trpc/reply',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                })];
            case 11:
                response = _b.sent();
                return [2 /*return*/, res.status(200).json(req.body)];
            case 12:
                error_1 = _b.sent();
                console.log(error_1);
                return [2 /*return*/, res.status(500).json({ message: 'Internal Error', error: error_1 })];
            case 13: return [2 /*return*/];
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
var generateMessageArray = function (prev, message) {
    var result = prev.messages.map(function (mess) { return ({
        content: mess.body,
        role: mess.role
    }); });
    result.push({ role: types_1.role.User, content: message });
    return result;
};
app.post('/generate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, prevMessagesId, message, prevMessages, messages, prompt, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, prevMessagesId = _a.prevMessagesId, message = _a.message;
                return [4 /*yield*/, dbClient.messages.findUnique({
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
                    })];
            case 1:
                prevMessages = _b.sent();
                console.log('\n\n', prevMessages, '\n\n');
                if (!(prevMessages === null || prevMessages === void 0 ? void 0 : prevMessages.messages)) return [3 /*break*/, 3];
                messages = generateMessageArray(prevMessages, message);
                console.log('\n\n', messages, '\n\n');
                return [4 /*yield*/, (0, axios_1.default)({
                        method: 'POST',
                        baseURL: 'https://api.openai.com/v1/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer ".concat(OPENAI_API_KEY)
                        },
                        data: {
                            model: "gpt-3.5-turbo",
                            messages: messages,
                            temperature: 0.7,
                        }
                    })];
            case 2:
                prompt = _b.sent();
                return [2 /*return*/, res.status(200).json({ prompt: prompt.data.choices[0].message.content })];
            case 3: return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.log(error_2);
                return [2 /*return*/, res.status(500).json({ message: 'Internal Error', error: error_2 })];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) {
    return res.status(200).json({ message: 'Hello from server' });
});
app.post('/reply', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, parsedInput, _a, to, message, prevMessagesId, responseContent, responseChunks, _i, responseChunks_1, chunk, response, newMsg, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                client = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
                parsedInput = types_1.replyMessage.safeParse(req.body);
                if (!parsedInput.success) {
                    console.log('Validation Error');
                    return [2 /*return*/, res.status(400).json({ message: 'Validation Error' })];
                }
                _a = parsedInput.data, to = _a.to, message = _a.message, prevMessagesId = _a.prevMessagesId;
                responseContent = message;
                responseChunks = splitMessage(responseContent, 1599);
                _i = 0, responseChunks_1 = responseChunks;
                _b.label = 1;
            case 1:
                if (!(_i < responseChunks_1.length)) return [3 /*break*/, 5];
                chunk = responseChunks_1[_i];
                return [4 /*yield*/, client.messages.create({
                        body: chunk,
                        from: "whatsapp:".concat(TWILIO_PHONE_NUMBER),
                        to: to,
                    })];
            case 2:
                response = _b.sent();
                console.log("Message sent with SID: ".concat(response.sid));
                console.log('\n\n', response, '\n\n');
                return [4 /*yield*/, dbClient.message.create({
                        data: {
                            SmsMessageSid: response.sid,
                            MessageSid: response.sid,
                            messages: {
                                connect: {
                                    id: parseInt(prevMessagesId)
                                }
                            },
                            body: chunk,
                            role: types_1.role.Assistant
                        }
                    })];
            case 3:
                newMsg = _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/, res.status(200).json({ message: 'Message sent successfully' })];
            case 6:
                error_3 = _b.sent();
                console.error('Error sending message:', error_3);
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
