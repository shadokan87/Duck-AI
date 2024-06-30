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
exports.bootStrap = void 0;
const zod_1 = __importDefault(require("zod"));
const dotenv_vault_1 = require("dotenv-vault");
// Env
const envVariables = zod_1.default.object({
    OPENAI_API_KEY: zod_1.default.string(),
    CORS: zod_1.default.string(),
    SUPABASE_URL: zod_1.default.string(),
    SUPABASE_JWT_SECRET: zod_1.default.string(),
    SUPABASE_SERVICE_ROLE: zod_1.default.string()
});
function error(...args) {
    console.error(args);
    return 1; // Stop the server from starting
}
function bootStrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dotenvResult = (0, dotenv_vault_1.config)({
                DOTENV_KEY: process.env.DOTENV_KEY,
            });
            if (dotenvResult.error)
                return error("dotenv.config failed", error);
            if (Object.keys(dotenvResult.parsed).length === 0)
                return error("No environment variables found in the parsed dotenv result");
            envVariables.parse(dotenvResult.parsed);
            if (!process.env.CORS)
                return error("CORS variable is missing from env");
            console.log(dotenvResult.parsed);
        }
        catch (e) {
            console.error(e);
            return 1;
        }
        return 0;
    });
}
exports.bootStrap = bootStrap;
