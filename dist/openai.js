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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOpenAiCompletion = void 0;
const zod_1 = __importDefault(require("zod"));
const index_1 = require("./index");
const openai_utils_1 = require("./openai_utils");
const openai_1 = __importDefault(require("openai"));
const zod_to_json_schema_1 = __importDefault(require("zod-to-json-schema"));
const snippetSchema = zod_1.default.object({
    actionDescription: zod_1.default.string().describe("concise description of what this action does example: move element X and export it"),
    actionType: zod_1.default.enum(['create', 'update']).describe("type of action: 'create' for creating new code, 'update' for modifying existing code"),
    language: zod_1.default.string().describe('the language of the source code'),
    path: zod_1.default.string().describe("the file path"),
    sourceCode: zod_1.default.string().optional().describe("the source code, to be ignored if running in DRY mode")
});
const limit = 5;
const mock = false;
let apiCallCount = 0;
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
function handleOpenAiCompletion(taskId, project_root) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (apiCallCount >= limit) {
            throw new Error("API call limit reached");
        }
        const task = yield index_1.supabase.from('task').select('*').eq('id', taskId).single();
        if (task.error) {
            throw new Error("Task not found");
        }
        yield index_1.supabase.from('task').update({ state: 'PROCESSING' }).eq('id', task.data.id);
        const documents = (_a = task.data.attachments) === null || _a === void 0 ? void 0 : _a.map(elem => elem);
        const messages = [
            {
                role: 'system', content: `${openai_utils_1.rulesDef}
  #define no-partial-code "Always output the complete code without any omissions." #end
  #define no-broken-dependencies "If you move files around, make sure the dependencies stays intact or create them if required" #end
      `
            },
            {
                role: "user", content: `
    attachments:
      ${documents.map(doc => (0, openai_utils_1.attachment)(doc.path.substring(project_root.length), doc.content)).join('\n')}
    prompt:
      ${task.data.prompt}
    `
            }
        ];
        const tools = [
            {
                type: "function",
                function: {
                    name: "codeSnippets",
                    description: "the function to call with the result",
                    parameters: (0, zod_to_json_schema_1.default)(snippetSchema)
                }
            }
        ];
        const response = mock ? JSON.parse(openai_utils_1.mock_completion) : yield openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            tools: tools,
            tool_choice: "required",
        });
        yield index_1.supabase.from('task').update({ completion_response: JSON.stringify(response) }).eq('id', taskId);
        console.log("!response", JSON.stringify(response, null, 2));
        console.log("Task ID:", taskId);
        console.log("Task Data:", JSON.stringify(task.data, null, 2));
        console.log("Documents:", JSON.stringify(documents, null, 2));
        console.log("Messages:", JSON.stringify(messages, null, 2));
        console.log("!openai task", JSON.stringify(task));
        yield index_1.supabase.from('task').update({ state: 'COMPLETED' }).eq('id', task.data.id);
    });
}
exports.handleOpenAiCompletion = handleOpenAiCompletion;
