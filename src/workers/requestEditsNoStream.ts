import { workerData, parentPort } from "worker_threads";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import processUserMessage from "../lib/helpers/processUserMessage.js";
import parseGPTBuffer from "../lib/helpers/parseGPTBuffer.js";
import diff from "../lib/helpers/diff.js";
import buildSSEEvent from "../lib/helpers/buildSSEEvent.js";
import { copyEditorMessages } from "../lib/prompts/copyEditor.js";
import requestEdits from "../lib/prompts/requestEdits.js";
import referenceFootnotes from "../lib/prompts/referenceFootnotes.js";
import splitStringOnTokens from "../lib/helpers/splitStringOnTokens.js";
import { decode, encode } from "gpt-3-encoder";
import findSubstringIndices from "../lib/helpers/findSubstringIndicies.js";
import { splitStringAtPositions } from "../lib/helpers/splitStringAtPositions.js";
import removeSubstrings from "../lib/helpers/removeSubstrings.js";

interface Message {
  type: "suggestion";
  suggestion: string;
  insertionIndex: number;
}
const sendMessageToUser = (message: Message) => {
  if (parentPort) {
    // parentPort.postMessage(message);
    console.log(message);
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

export interface Footnote {
  offset: number;
  body: string;
  id: string;
}
export interface RequestEditsWorkerData {
  content: string;
  footnotes?: Footnote[];
}

export interface Suggestion {
  index: number;
  originalToken: string;
  replacement: string;
}

// Retrieve the processId from workerData
const { content, footnotes }: RequestEditsWorkerData = workerData;

try {
  const {
    processed: processedContent,
    tokens,
    max_tokens,
  } = processUserMessage(content);

  // build the gpt request
  const messages: ChatCompletionRequestMessage[] = [
    ...copyEditorMessages,
    requestEdits(processedContent, max_tokens),
  ];

  await openai
    .createChatCompletion({
      model: "gpt-4",
      messages:
        footnotes !== undefined
          ? [...messages, referenceFootnotes(footnotes)]
          : messages,
      stream: false,
    })
    .catch((error) => console.error(error))

    .then((response) => {
      if (response) {
        const suggestion = response.data.choices[0].message?.content;
        if (suggestion === undefined) return;

        console.log(suggestion);

        let sequentialChanges: { insertionIndex: number; token: number }[] = [];

        if (footnotes !== undefined) {
          // find the position of the footnotes in the content
          const footnotePositions = footnotes.map((footnote) => {
            const originalIndex = findSubstringIndices(content, footnote.id)[0];
            const newIndex = findSubstringIndices(suggestion, footnote.id)[0];
            return { ...footnote, newIndex, originalIndex };
          });

          const splitSuggestion = splitStringAtPositions(
            suggestion,
            footnotePositions.map(({ newIndex }) => newIndex)
          );

          const footnoteRefs = footnotes.map(({ id }) => id);
          const plaintextOriginal = removeSubstrings(content, footnoteRefs);
          // console.log(plaintextOriginal);
          const encodedOriginal = encode(plaintextOriginal);
          // console.log("original", encodedOriginal);
          const encodedSuggestions = splitSuggestion.map((suggestion) =>
            encode(removeSubstrings(suggestion, footnoteRefs))
          );

          let suggestionOffset = 0;
          for (
            let suggestionIndex = 0;
            suggestionIndex < encodedSuggestions.length;
            suggestionIndex++
          ) {
            const encodedSuggestion = encodedSuggestions[suggestionIndex];
            // console.log("suggestion", encodedSuggestion);
            // console.log("offset", suggestionOffset);
            for (
              let tokenIndex = 0;
              tokenIndex < encodedSuggestion.length;
              tokenIndex++
            ) {
              const comparisonIndex = tokenIndex + suggestionOffset;
              const originalToken = encodedOriginal[comparisonIndex];
              const newToken = encodedSuggestion[tokenIndex];
              const isChange =
                newToken !== originalToken ||
                typeof originalToken === "undefined";
              // console.log(suggestionIndex, suggestionOffset, tokenIndex);
              // console.log(originalToken, newToken, isChange);

              if (isChange) {
                sequentialChanges.push({
                  insertionIndex: comparisonIndex,
                  token: newToken,
                });
                if (
                  suggestionIndex === encodedSuggestions.length - 1 &&
                  tokenIndex === encodedSuggestion.length - 1
                ) {
                  // this is the last token, return to user
                  sendMessageToUser({
                    type: "suggestion",
                    suggestion: decode(
                      sequentialChanges.map(({ token }) => token)
                    ),
                    insertionIndex: sequentialChanges[0].insertionIndex,
                  });
                }
              } else {
                if (sequentialChanges.length > 0) {
                  // collect the changes and send them to the user
                  sendMessageToUser({
                    type: "suggestion",
                    suggestion: decode(
                      sequentialChanges.map(({ token }) => token)
                    ),
                    insertionIndex: sequentialChanges[0].insertionIndex,
                  });
                } else {
                }
                // reset sequentialChanges
                sequentialChanges = [];
              }
            }

            suggestionOffset = suggestionOffset + encodedSuggestion.length;
          }
        } else {
        }
      }
    });
} catch (error) {
  // Handle API request errors
  console.error("An error occurred during OpenAI request");
  console.error(error);
}
