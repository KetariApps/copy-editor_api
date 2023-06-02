import { encode } from "gpt-3-encoder";
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
        const collectedResponse: number[] = [];
        let currentIndex: number = 0;
        let currentReplacement: Suggestion[] = [];

        // Handle the response stream
        // @ts-expect-error
        response.data.on("data", (chunk: Buffer) => {
          try {
            // Process each chunk of data
            const { type, data } = parseGPTBuffer(chunk);

            if ("content" in data.choices[0].delta) {
              const tokens = encode(data.choices[0].delta.content);
              collectedResponse.push(...tokens);

              const difference = diff(tokenizedContent, {
                tokens,
                index: currentIndex,
              });
              currentIndex += 1;

              if (difference !== false) {
                // push the new difference to the currentSuggestion
                currentReplacement.push(difference);
              } else if (
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
