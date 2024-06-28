import z from 'zod';
import { config } from 'dotenv-vault'

// Env
const envVariables = z.object({
  OPENAI_API_KEY: z.string()
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> { }
  }
}

function error(...args: any) {
  console.error(args);
  return 1; // Stop the server from starting
}

export async function bootStrap() {
  try {
    const dotenvResult = config({
      DOTENV_KEY: process.env.DOTENV_KEY,
    });

    if (dotenvResult.error)
      return error("dotenv.config failed", error);

    if (Object.keys(dotenvResult.parsed!).length === 0)
      return error("No environment variables found in the parsed dotenv result");

    envVariables.parse(dotenvResult.parsed);

    if (!process.env.CORS)
      return error("CORS variable is missing from env");

  } catch (e) {
    console.error(e);
    return 1;
  }
  return 0;
}