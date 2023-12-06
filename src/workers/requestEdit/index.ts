import { workerData } from "worker_threads";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import processOriginalText from "./processOriginalText.js";
import copyEditorMessages from "../../lib/prompts/copyEditorMessages/index.js";
import makeRequestEditsMessage from "../../lib/prompts/makeRequestEditsMessage.js";
import { EditResponseMessage } from "../types.js";
import sendMessageToMainProcess from "../lib/sendMessageToMainProcess.js";
import { RequestEditWorkerData } from "./types.js";

//// env stuff
dotenv.config();
const { OPENAI_API_KEY } = process.env;
//// openai stuff
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const {
  content,
  footnotes,
  workerId,
  shouldGenerateComments,
}: RequestEditWorkerData = workerData;

try {
  const { processedOriginalText, max_tokens } = processOriginalText(content);

  // build the gpt request
  const messages: ChatCompletionRequestMessage[] = [
    ...copyEditorMessages,
    makeRequestEditsMessage(processedOriginalText, max_tokens),
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
        const suggestion = response.data.choices[0].message?.content;

        if (suggestion === undefined) return;

        // once we have the suggested edit, send the original end edited version back to the main stream so they can be handled by the other workers
        const editResponseMessage: EditResponseMessage = {
          originalVersion: content,
          editedVersion: suggestion,
          footnotes: footnotes,
          type: "edit",
          shouldGenerateComments,
        };

        sendMessageToMainProcess(editResponseMessage);

        // handleSuggestion(content, suggestion, footnotes);
      }
      // emit the done event
      sendMessageToMainProcess({ type: "done", workerId });
    });
} catch (error) {
  // Handle API request errors
  console.error("An error occurred during OpenAI request");
  console.error(error);
}
