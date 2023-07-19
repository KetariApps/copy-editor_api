import { workerData, parentPort } from "worker_threads";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import processUserMessage from "../lib/helpers/processUserMessage.js";
import parseGPTBuffer from "../lib/helpers/parseGPTBuffer.js";
import diff from "../lib/helpers/diff.js";
import buildSSEEvent from "../lib/helpers/buildSSEEvent.js";
import { copyEditor } from "../lib/prompts/copyEditor.js";
import requestEdits from "../lib/prompts/requestEdits.js";

function postMessage(message: string) {
  if (parentPort) {
    parentPort.postMessage(message);
  } else {
    // `parentPort` is null, handle this case accordingly
    console.error("parentPort is not available");
  }
}

//// env stuff
dotenv.config();
const { OPENAI_API_KEY } = process.env;
//// openai stuff
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
export interface RequestEditsWorkerData {
  content: string;
}

export interface Suggestion {
  index: number;
  originalSubstring: string;
  replacement: string;
}

// Retrieve the processId from workerData
const { content }: RequestEditsWorkerData = workerData;

try {
  const {
    processed: processedContent,
    tokens,
    max_tokens,
  } = processUserMessage(content);

  // build the gpt request
  const messages: ChatCompletionRequestMessage[] = [
    ...copyEditor,
    requestEdits(processedContent, max_tokens),
  ];

  await openai
    .createChatCompletion(
      {
        model: "gpt-4",
        messages,
        stream: true,
      },
      { responseType: "stream" }
    )
    .catch((error) => console.error(error))

    .then((response) => {
      const collectedResponse: string[] = [];
      let currentIndex: number = 0;
      let currentReplacement: Suggestion[] = [];

      // Handle the response stream
      // @ts-expect-error
      response.data.on("data", (chunk: Buffer) => {
        try {
          // Process each chunk of data
          const data = parseGPTBuffer(chunk);
          if (data === undefined) return;
          if ("content" in data.choices[0].delta) {
            const suggestion = data.choices[0].delta.content;
            console.log(suggestion);

            // Use to limit the diff-ing. When the gap between diffs is buffer or less, it will treat them as the same diff
            const bufferReset = 1;
            let buffer = bufferReset;
            // console.log(suggestion);
            for (const character of suggestion) {
              collectedResponse.push(character);

              const difference = diff(processedContent, {
                suggestion: character,
                index: currentIndex,
              });

              // SUGGESTION BRANCH
              // This branch handles all cases where there is a difference in token at the position of the current index.
              if (difference !== false) {
                // push the new difference to the currentSuggestion
                currentReplacement.push(difference);

                // reset buffer
                buffer = bufferReset;
              }
              // RETURN BRANCH
              // This branch handles the case where there is no difference in token at the position of the current index,
              // and there are currently staged suggestions. In this case, the api should send back the completed Suggestion.
              else if (
                difference === false &&
                currentReplacement.length > 0 &&
                buffer < 0
              ) {
                // send the completed suggestion back to the user

                const event = buildSSEEvent(
                  currentReplacement.slice(
                    0,
                    currentReplacement.length + buffer
                  )
                );
                postMessage(JSON.stringify(event));

                // reset currentReplacement
                currentReplacement = [];
                // reset buffer
                buffer = bufferReset;
              }
              // BUFFER BRANCH
              // If there is no proposed replacement and the diff is false, consume one buffer
              else if (difference === false && currentReplacement.length > 0) {
                buffer = buffer - 1;

                // push the new difference to the currentSuggestion
                const bufferSuggestion: Suggestion = {
                  index: currentIndex,
                  originalSubstring: processedContent.slice(
                    currentIndex,
                    currentIndex + 1
                  ),
                  replacement: character,
                };
                currentReplacement.push(bufferSuggestion);
              }
              // no action is necessary on any other event type

              currentIndex += 1;
            }
          } else {
            return undefined;
          }
        } catch (error) {
          console.error("Error processing the chunk:", error);
        }
      });

      // @ts-expect-error
      response.data.on("end", () => {
        if (currentReplacement.length > 0) {
          const event = buildSSEEvent(currentReplacement);
          postMessage(JSON.stringify(event));

          // reset currentReplacement
          currentReplacement = [];
        }

        // emit the done event
        postMessage("done");
      });

      // @ts-expect-error
      response.data.on("error", (error: Error) => {
        // Handle any stream errors
        postMessage("error");
      });
    });
} catch (error) {
  // Handle API request errors
  console.error("An error occurred during OpenAI request");
  // console.log(error);
}
