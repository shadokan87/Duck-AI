import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { bootStrap } from "./env";
import { Iservices, addService, services as servicesNonStatic } from "./services";
import OpenAI from "openai";
import z from "zod";
import cors from "cors";
import * as jwt from 'jsonwebtoken';
import { Database } from "./types/supabase";
import { DecodedUser } from "./types/decoded";
import { createClient } from "@supabase/supabase-js";

const app: Express = express().use(cors({ origin: process.env.CORS })).use(express.json());
const port = process.env.PORT || 3000;
const services = servicesNonStatic as Iservices;
const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);
type taskType = Database['public']['Tables']['task']['Insert'];
async function addTask(user: DecodedUser, attachments: string[], prompt: string, state: taskType['state'] = 'AWAITING_ATTACHMENTS') {
  const { data, error } = await supabase
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
  } else {
    console.log('Data inserted successfully:', data);
  }
  return data;
}

const promptBodySchema = z.object({
  prompt: z.string(),
  attachments: z.array(z.string()),
});

app.post("/prompt", async (req: Request, res: Response) => {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    res.status(401).send("Access token is missing");
    return;
  }
  let user: DecodedUser | undefined = undefined;
  try {
    const decoded = jwt.verify(accessToken, process.env.SUPABASE_JWT_SECRET);
    console.log("!type", typeof decoded);
    user = decoded as DecodedUser;
  } catch (err) {
    res.status(401).send("Invalid access token");
    return;
  }

  const body = promptBodySchema.safeParse(req.body);
  console.log("!body", body);
  if (!body.success) {
    res.status(400).send(body.error);
    return;
  }
  const taskCreationResponse = await addTask(user, body.data.attachments, body.data.prompt);
  res.send(taskCreationResponse);
});

const queueTaskBodySchema = z.object({
  task_id: z.number(),
});

app.post("/queue", async (req: Request, res: Response) => {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    res.status(401).send("Access token is missing");
    return;
  }
  let user: DecodedUser | undefined = undefined;
  try {
    const decoded = jwt.verify(accessToken, process.env.SUPABASE_JWT_SECRET);
    user = decoded as DecodedUser;
  } catch (err) {
    res.status(401).send("Invalid access token");
    return;
  }
  const taskBody = queueTaskBodySchema.safeParse(req.body);
  if (!taskBody.success) {
    res.status(400).send(taskBody.error);
    return;
  }
  try {
    const updateResponse = await supabase.from('task').update({ state: 'QUEUE' }).eq('id', taskBody.data.task_id);
    if (updateResponse.error)
      throw new Error("Unexpected error");
  } catch (e) {
    res.status(500).send(e);
    return;
  }
  res.send("sucess");
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, async () => {
  const init = await bootStrap();
  addService("openai", OpenAI, { apiKey: process.env.OPENAI_API_KEY });
  if (init)
    process.exit(init);
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

