import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Worker } from "worker_threads";
import { v4 as uuid } from "uuid";
import { DoneMessage } from "./workers/lib/types.js";
import buildSSEResponse from "./lib/buildSSEResponse.js";
import {
  CommentMessage,
  GenerateCommentsWorkerData,
} from "./workers/generateComments/types.js";
import EditStream from "./lib/editStream.js";
import {
  EditRequest,
  StreamMap,
  StreamMessage,
  WorkerMap,
  WorkerRole,
} from "./lib/types.js";
import {
  BatchSuggestionMessage,
  Diff,
  HandleEditWorkerData,
  SuggestionMessage,
} from "./workers/handleEditV2/types.js";
import { RequestEditWorkerData } from "./workers/requestEdit/types.js";
import removeSubstrings from "./workers/handleEditV2/lib/removeSubstrings.js";
import lDiggityDiff from "./workers/handleEditV2/lib/lDiggityDiff.js";

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
const streams: StreamMap = new Map();
const workers: WorkerMap = new Map();
// SSE endpoint
// stream results to specific users
app.get("/sse", (req: Request, res: Response) => {
  try {
    const streamId = req.query.streamId as string;

    //
    const stream = streams.get(streamId);
    if (stream === undefined) {
      res.status(404).send("Error locating stream");
      return;
    } else {
      // Found the matching stream. Begin listening for updates.
      stream.on("data", (chunk) => {
        const message = chunk as StreamMessage;

        if (message.type === "edit") {
          if (message.shouldGenerateComments === true) {
            message.shouldGenerateComments = true;
            const generateCommentsWorkerId = uuid();
            const generateCommentsWorkerData: GenerateCommentsWorkerData = {
              workerId: generateCommentsWorkerId,
              ...message,
            };
            const generateCommentsWorker = new Worker(
              "./build/workers/generateComments/index.js",
              {
                workerData: generateCommentsWorkerData,
              }
            );
            workers.set(generateCommentsWorkerId, [
              generateCommentsWorker,
              WorkerRole.CommentGetter,
            ]);
            generateCommentsWorker.on(
              "message",
              (message: CommentMessage | DoneMessage) => {
                if (message.type === "comment") {
                  stream.write(message);
                } else {
                  res.end();
                  stream.end();
                }
              }
            );
          }

          const originalWithoutAnchorRefs = message.footnotes
            ? removeSubstrings(
                message.originalVersion,
                message.footnotes.map(({ id }) => `|${id}|`)
              )
            : message.originalVersion;
          const changeSequence: Diff[] = lDiggityDiff(
            originalWithoutAnchorRefs,
            message.editedVersion
          );

          const batchSuggestionMessage: BatchSuggestionMessage = {
            type: "batch-suggestion",
            suggestions: changeSequence.map(
              ({ change, operation, index }): SuggestionMessage => ({
                type: "suggestion",
                operation,
                content: change,
                ref: {
                  index: index.old,
                  substring: originalWithoutAnchorRefs[index.old],
                },
              })
            ),
          };

          const userResponse = buildSSEResponse(batchSuggestionMessage);
          console.log(userResponse);
          res.write(JSON.stringify(userResponse));

          message.shouldGenerateComments === false && res.end();
          stream.end();

          // const handleEditsWorkerWorkerId = uuid();
          // const handleEditsWorkerData: HandleEditWorkerData = {
          //   workerId: handleEditsWorkerWorkerId,
          //   ...message,
          // };
          // const handleEditWorker = new Worker(
          //   "./build/workers/handleEditV2/index.js",
          //   {
          //     workerData: handleEditsWorkerData,
          //   }
          // );
          // workers.set(handleEditsWorkerWorkerId, [
          //   handleEditWorker,
          //   WorkerRole.EditHandler,
          // ]);
          // handleEditWorker.on(
          //   "message",
          //   (message: SuggestionMessage | DoneMessage) => {
          //     if (message.type === "suggestion") {
          //       stream.write(message);
          //     } else {
          //       anticipateComments === false && res.end();
          //     }
          //   }
          // );
        } else {
          // message comes from comments worker - write to the user
          const userResponse = buildSSEResponse(message);
          console.log(userResponse);
          res.write(`data: ${userResponse}\n\n`);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
});

// edit endpoint
// request edits
app.post("/edit", (req: Request, res: Response) => {
  try {
    const streamId = uuid();
    const workerId = uuid();
    const editRequest = req.body as EditRequest;

    console.log(buildSSEResponse(editRequest));
    /**
     * Create a new stream for this edit request
     * This stream will receive all messages from all workers working on this edit
     */
    const stream = new EditStream({ objectMode: true });
    streams.set(streamId, stream);
    const requestEditsWorkerData: RequestEditWorkerData = {
      workerId,
      ...editRequest,
    };
    const requestEditWorker = new Worker(
      "./build/workers/requestEdit/index.js",
      {
        workerData: requestEditsWorkerData,
      }
    );

    /**
     * The first worker to spawn is the requestEditsWorker
     * This worker is in charge of making the initial request to openAI
     */
    workers.set(workerId, [requestEditWorker, WorkerRole.EditGetter]);
    requestEditWorker.on("message", (message) =>
      stream.write({ workerId, ...message })
    );
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
