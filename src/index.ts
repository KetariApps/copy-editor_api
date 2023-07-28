import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Worker } from "worker_threads";
import { v4 as uuid } from "uuid";
import type { RequestEditsWorkerData } from "./workers/lib/types.d.ts";

//// env stuff
dotenv.config();
const { PORT } = process.env;

const app = express();

// configure cors
const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Enable parsing of request bodies
app.use(express.json());

const workers: Map<string, Worker> = new Map();

// SSE endpoint
// stream results to specific users
app.get("/sse", (req: Request, res: Response) => {
  try {
    const streamId = req.query.streamId as string;
    const worker = workers.get(streamId);

    if (worker === undefined) {
      res.status(404).send("Error locating worker");
      return;
    }

    worker.on("message", (message: string) => {
      if (message === "done") {
        workers.delete(streamId);
        res.end();
      } else if (message === "error") {
        console.error("Error from worker");
      } else {
        console.log(JSON.stringify({ streamId, ...JSON.parse(message) }));
        res.write(`data: ${message}\n\n`);
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// edit endpoint
// request edits
app.post("/edit", (req: Request, res: Response) => {
  try {
    const workerData = req.body as RequestEditsWorkerData;
    const streamId = uuid();
    console.log(
      JSON.stringify({ type: "initialization", streamId, workerData })
    );
    const worker = new Worker("./build/workers/requestEditsNoStream.js", {
      workerData,
    });

    workers.set(streamId, worker);
    res.write(JSON.stringify({ streamId }), () => {
      res.end();
    });
  } catch (error) {
    console.error(error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
