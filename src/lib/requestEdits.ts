import { decode, encode } from "gpt-3-encoder";
import { systemFoundations } from "./prompts/sysFoundations.js";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { Response } from "express";
import parseGPTBuffer from "./helpers/parseGPTBuffer.js";
import diff from "./helpers/diff.js";
import buildSSEEvent from "./helpers/buildSSEEvent.js";
import processUserMessage from "./helpers/processUserMessage.js";

export interface Suggestion {
  index: number;
  originalSubstring: string;
  replacement: string;
}

export default async function requestEdits(
  content: string,
  openai: OpenAIApi,
  responseStream: Response
) {
  const { processed: processedContent, tokens: tokenizedContent } =
    processUserMessage(content);

  // build the gpt request
  const messages: ChatCompletionRequestMessage[] = [
    ...systemFoundations.copyEditor,
    { role: "user", content: processedContent },
  ];

  // get the response
  try {
    await openai
      .createChatCompletion(
        {
          model: "gpt-4",
          messages,
          stream: true,
        },
        { responseType: "stream" }
      )

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

              for (const character of suggestion) {
                collectedResponse.push(character);

                const difference = diff(processedContent, {
                  suggestion: character,
                  index: currentIndex,
                });
                currentIndex += 1;

                // SUGGESTION BRANCH
                // This branch handles all cases where there is a difference in token at the position of the current index.
                if (difference !== false) {
                  // push the new difference to the currentSuggestion
                  currentReplacement.push(difference);
                }
                // RETURN BRANCH
                // This branch handles the case where there is no difference in token at the position of the current index,
                // and there are currently staged suggestions. In this case, the api should send back the completed Suggestion.
                else if (
                  difference === false &&
                  currentReplacement.length > 0
                ) {
                  // send the completed suggestion back to the user

                  const event = buildSSEEvent(currentReplacement);
                  responseStream.write(
                    `event: edit\ndata: ${JSON.stringify(event)}\n\n`
                  );

                  // reset currentReplacement
                  currentReplacement = [];
                }
                // no action is necessary on any other event type
              }
            }
          } catch (error) {
            console.error("Error processing the chunk:", error);
          }
        });

        // @ts-expect-error
        response.data.on("end", () => {
          if (currentReplacement.length > 0) {
            const event = buildSSEEvent(currentReplacement);
            responseStream.write(
              `event: edit\ndata: ${JSON.stringify(event)}\n\n`
            );

            // reset currentReplacement
            currentReplacement = [];
          }

          // Stream ended, do any final processing here
          // Close the SSE connection after sending all the edited chunks
          responseStream.end();
        });

        // @ts-expect-error
        response.data.on("error", (error: Error) => {
          // Handle any stream errors
        });
      });
  } catch (error) {
    // Handle API request errors
    console.error("An error occurred during OpenAI request", error);
  }
}
