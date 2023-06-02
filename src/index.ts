import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Worker } from "worker_threads";
import { v4 as uuid } from "uuid";
import { RequestEditsWorkerData } from "./workers/requestEdits.js";

//// env stuff
dotenv.config();
const { PORT } = process.env;

const app = express();
app.use(cors());

// Enable parsing of request bodies
app.use(express.json());

const workers: Map<string, Worker> = new Map();

// SSE endpoint
// stream results to specific users
app.get("/sse", (req: Request, res: Response) => {
  const streamId = req.query.streamId as string;
  const worker = workers.get(streamId);
  if (worker === undefined) {
    res.write("Error locating worker", () => res.end());
  }

  worker?.on("message", (message: string) => {
    if (message === "done") {
      workers.delete(streamId);
      res.end();
      return;
    } else if (message === "error") {
      console.error("error from worker");
    } else {
      res.write(message);
    }
  });
});

// edit endpoint
// request edits
app.post("/edit", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const content = req.body.message; // Assuming the request contains a "message" property
  const streamId = uuid();
  // const streamId = uuid();
  const workerData: RequestEditsWorkerData = {
    streamId,
    content,
  };
  const worker = new Worker("./build/workers/requestEdits.js", {
    workerData,
  });
  workers.set(streamId, worker);
  res.write(JSON.stringify({ streamId }), () => {
    // console.log("sent response, closing stream");
    res.end();
  });
  // return await requestEdits(userMessage, openai, emitter).then((_) => userId);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
