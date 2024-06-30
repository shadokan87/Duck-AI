"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./env");
const services_1 = require("./services");
const openai_1 = __importDefault(require("openai"));
const zod_1 = __importDefault(require("zod"));
const cors_1 = __importDefault(require("cors"));
const jwt = __importStar(require("jsonwebtoken"));
const supabase_js_1 = require("@supabase/supabase-js");
const app = (0, express_1.default)().use((0, cors_1.default)({ origin: process.env.CORS })).use(express_1.default.json());
const port = process.env.PORT || 3000;
const services = services_1.services;
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
function addTask(user, attachments, prompt, state = 'AWAITING_ATTACHMENTS') {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('task')
            .insert([
            {
                attachments: attachments.map(attachment => ({ path: attachment, content: "NONE" })),
                created_by: user.sub,
                prompt,
                state
            }
        ]);
        if (error) {
            console.error('Error inserting data:', error);
        }
        else {
            console.log('Data inserted successfully:', data);
        }
        return data;
    });
}
const promptBodySchema = zod_1.default.object({
    prompt: zod_1.default.string(),
    attachments: zod_1.default.array(zod_1.default.string()),
});
app.post("/prompt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.headers['authorization'];
    if (!accessToken) {
        res.status(401).send("Access token is missing");
        return;
    }
    let user = undefined;
    try {
        const decoded = jwt.verify(accessToken, process.env.SUPABASE_JWT_SECRET);
        console.log("!type", typeof decoded);
        user = decoded;
    }
    catch (err) {
        res.status(401).send("Invalid access token");
        return;
    }
    const body = promptBodySchema.safeParse(req.body);
    console.log("!body", body);
    if (!body.success) {
        res.status(400).send(body.error);
        return;
    }
    const taskCreationResponse = yield addTask(user, body.data.attachments, body.data.prompt);
    res.send(taskCreationResponse);
}));
const queueTaskBodySchema = zod_1.default.object({
    task_id: zod_1.default.number(),
});
app.post("/queue", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.headers['authorization'];
    if (!accessToken) {
        res.status(401).send("Access token is missing");
        return;
    }
    let user = undefined;
    try {
        const decoded = jwt.verify(accessToken, process.env.SUPABASE_JWT_SECRET);
        user = decoded;
    }
    catch (err) {
        res.status(401).send("Invalid access token");
        return;
    }
    const taskBody = queueTaskBodySchema.safeParse(req.body);
    if (!taskBody.success) {
        res.status(400).send(taskBody.error);
        return;
    }
    try {
        const updateResponse = yield supabase.from('task').update({ state: 'QUEUE' }).eq('id', taskBody.data.task_id);
        if (updateResponse.error)
            throw new Error("Unexpected error");
    }
    catch (e) {
        res.status(500).send(e);
        return;
    }
    res.send("sucess");
}));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    const init = yield (0, env_1.bootStrap)();
    (0, services_1.addService)("openai", openai_1.default, { apiKey: process.env.OPENAI_API_KEY });
    if (init)
        process.exit(init);
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
}));
