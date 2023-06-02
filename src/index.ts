import express, { Request, Response } from "express";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import requestEdits from "./lib/requestEdits.js";
import cors from "cors";

//// env stuff
dotenv.config();
const { OPENAI_API_KEY, PORT } = process.env;
//// openai stuff
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());

// Enable parsing of request bodies
app.use(express.json());

// SSE endpoint
app.post("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");

  // Send initial event to establish SSE connection
  res.write("event: connected\n\n");

  // Handle the request from the user
  handleUserRequest(req, res);
});

// Handle user request and stream response
// add openai api request and prompting
async function handleUserRequest(req: Request, res: Response) {
  const userMessage = req.body.message; // Assuming the request contains a "message" property

  // do any pre-processing

  await requestEdits(userMessage, openai, res);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
