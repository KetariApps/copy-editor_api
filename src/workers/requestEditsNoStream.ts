import { workerData, parentPort } from "worker_threads";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import processOriginalText from "./lib/processOriginalText.js";
import { copyEditorMessages } from "../lib/prompts/copyEditor.js";
import requestEdits from "../lib/prompts/requestEdits.js";
import handleSuggestion from "./lib/handleSuggestion.js";
import type { RequestEditsWorkerData } from "./lib/types.d.ts";

const sendMessageToUser = (message: string) => {
  if (parentPort) {
    parentPort.postMessage(message);
  } else {
    // `parentPort` is null, handle this case accordingly
    console.error("parentPort is not available");
  }
};

//// env stuff
dotenv.config();
const { OPENAI_API_KEY } = process.env;
//// openai stuff
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Retrieve the processId from workerData
const { content, footnotes }: RequestEditsWorkerData = workerData;

try {
  const { processedOriginalText, max_tokens } = processOriginalText(content);

  // build the gpt request
  const messages: ChatCompletionRequestMessage[] = [
    ...copyEditorMessages,
    requestEdits(processedOriginalText, max_tokens),
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
        handleSuggestion(content, suggestion, footnotes);
      }
      // emit the done event
      sendMessageToUser("done");
    });
} catch (error) {
  // Handle API request errors
  console.error("An error occurred during OpenAI request");
  console.error(error);
}
