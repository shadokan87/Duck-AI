import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { bootStrap } from "./env";
import { Iservices, addService, services as servicesNonStatic } from "./services";
import OpenAI from "openai";
import z from "zod";

const app: Express = express();
const port = process.env.PORT || 3000;
const services = servicesNonStatic as Iservices;


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, async () => {
  const init = await bootStrap();
  addService("openai", OpenAI, {apiKey: process.env.OPENAI_API_KEY});
  if (init)
    process.exit(init);
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});