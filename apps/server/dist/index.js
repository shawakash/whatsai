"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
dotenv_1["default"].config();
var app = (0, express_1["default"])();
var PORT = process.env.PORT;
app.use(body_parser_1["default"].urlencoded({
    extended: true
}));
app.use(body_parser_1["default"].json());
app.use((0, cors_1["default"])());
app.post('/query', function (req, res) {
    console.log(req);
    return res.status(200).json(req.body);
});
app.get('/', function (req, res) {
    return res.status(200).json({ message: 'Hello from server' });
});
app.listen(PORT, function () {
    console.log("Server Running on Port: ".concat(PORT));
});
