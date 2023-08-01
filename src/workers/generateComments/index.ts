import { workerData } from "worker_threads";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import sendMessageToMainProcess from "../lib/sendMessageToMainProcess.js";
import globalMessages from "../../lib/prompts/globalMessages.js";
import {
  generateCommentsAssistantMessages,
  generateCommentsUserMessage,
} from "../../lib/prompts/generateCommentsMessages/index.js";
import { CommentMessage, GenerateCommentsWorkerData } from "./types.js";

//// env stuff
dotenv.config();
const { OPENAI_API_KEY } = process.env;
//// openai stuff
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const { originalVersion, editedVersion, workerId }: GenerateCommentsWorkerData =
  workerData;

try {
  // build the gpt request
  const messages: ChatCompletionRequestMessage[] = [
    ...globalMessages,

    generateCommentsUserMessage,
    ...generateCommentsAssistantMessages(originalVersion, editedVersion),
  ];

  await openai
    .createChatCompletion({
      model: "gpt-4",
      messages,
      stream: false,
    })
    .catch((error) => console.error(error))

    .then((response) => {
      if (response) {
        const comment = response.data.choices[0].message?.content;

        const message: CommentMessage = {
          originalVersion,
          editedVersion,
          comment,
          type: "comment",
        };
        console.log("comment from worker:\n\n", message);
        sendMessageToMainProcess(message);
      }
      // emit the done event
      sendMessageToMainProcess({ type: "done", workerId });
    });
} catch (error) {
  // Handle API request errors
  console.error("An error occurred during OpenAI request");
  console.error(error);
}
