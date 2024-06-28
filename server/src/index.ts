import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { bootStrap } from "./env";
import { Iservices, addService, services } from "./services";

const app: Express = express();
const port = process.env.PORT || 3000;


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, async () => {
  const init = await bootStrap();
  console.log(process.env);
  if (init)
    process.exit(init);
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});