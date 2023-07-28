import { workerData, parentPort } from "worker_threads";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import processUserMessage from "../lib/helpers/processUserMessage.js";
import { copyEditorMessages } from "../lib/prompts/copyEditor.js";
import requestEdits from "../lib/prompts/requestEdits.js";
import { decode, encode } from "gpt-3-encoder";
import findSubstringIndices from "../lib/helpers/findSubstringIndicies.js";
import { splitStringAtPositions } from "../lib/helpers/splitStringAtPositions.js";
import removeSubstrings from "../lib/helpers/removeSubstrings.js";

export interface Footnote {
  offset: number;
  body: string;
  id: string;
}
export interface Message {
  type: "suggestion";
  suggestion: string;
  originalSubstring: string;
  insertionIndex: number;
  endingFootnote?: Footnote;
}
export interface RequestEditsWorkerData {
  content: string;
  footnotes?: Footnote[];
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}

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
      messages,
      // messages:
      //   footnotes !== undefined
      //     ? [...messages, referenceFootnotes(footnotes)]
      //     : messages,
      stream: false,
    })
    .catch((error) => console.error(error))

    .then((response) => {
      if (response) {
        const suggestion = response.data.choices[0].message?.content;
        if (suggestion === undefined) return;

        if (footnotes !== undefined) {
          // find the position of the footnotes in the content
          const footnotePositions = footnotes.map((footnote) => {
            const ref = `|${footnote.id}|`;
            const originalIndex = findSubstringIndices(content, ref)[0];
            const newIndex = findSubstringIndices(suggestion, ref)[0];
            return { ...footnote, newIndex, originalIndex };
          });

          const footnoteRefs = footnotes.map(({ id }) => `|${id}|`);

          const encodedSuggestions = splitStringAtPositions(
            suggestion,
            footnotePositions.map(({ newIndex }) => newIndex)
          ).map((substring) => {
            const parsedPlaintext = removeSubstrings(substring, footnoteRefs);
            return encode(parsedPlaintext);
          });

          const plaintextOriginal = removeSubstrings(content, footnoteRefs);
          const encodedOriginal = encode(plaintextOriginal);

          let suggestionOffset = 0;
          for (
            let suggestionIndex = 0;
            suggestionIndex < encodedSuggestions.length;
            suggestionIndex++
          ) {
            let sequentialChanges: SequentialChange[] = [];
            const encodedSuggestion = encodedSuggestions[suggestionIndex];
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

              if (isChange) {
                sequentialChanges.push({
                  comparisonIndex,
                  token: newToken,
                });
                if (tokenIndex === encodedSuggestion.length - 1) {
                  // this is the last token of the suggestion, return to user
                  const endOfSliceIndex =
                    suggestionIndex === encodedSuggestions.length - 1
                      ? Math.max(comparisonIndex, encodedOriginal.length - 1)
                      : comparisonIndex;
                  const userMessage: Message = {
                    type: "suggestion",
                    suggestion: decode(
                      sequentialChanges.map(({ token }) => token)
                    ),
                    originalSubstring: decode(
                      encodedOriginal.slice(
                        sequentialChanges[0].comparisonIndex,
                        endOfSliceIndex
                      )
                    ),
                    insertionIndex: decode(
                      encodedOriginal.slice(
                        0,
                        sequentialChanges[0].comparisonIndex
                      )
                    ).length,
                    endingFootnote: footnotes[suggestionIndex],
                  };
                  console.log("Suggestion to user:\n\n", userMessage);
                  sendMessageToUser(JSON.stringify(userMessage));
                }
              } else {
                if (sequentialChanges.length > 0) {
                  // collect the changes and send them to the user
                  const userMessage: Message = {
                    type: "suggestion",
                    suggestion: decode(
                      sequentialChanges.map(({ token }) => token)
                    ),
                    originalSubstring: decode(
                      encodedOriginal.slice(
                        sequentialChanges[0].comparisonIndex,
                        comparisonIndex
                      )
                    ),
                    insertionIndex: decode(
                      encodedOriginal.slice(
                        0,
                        sequentialChanges[0].comparisonIndex
                      )
                    ).length,
                  };
                  console.log("Suggestion to user:\n\n", userMessage);
                  sendMessageToUser(JSON.stringify(userMessage));
                } else {
                }
                // reset sequentialChanges
                sequentialChanges = [];
              }
            }

            suggestionOffset = suggestionOffset + encodedSuggestion.length - 1;
          }
        } else {
          // handle the case of simple text where there are no footnotes in the user's request
        }
      }

      // emit the done event
      sendMessageToUser("done");
    });
} catch (error) {
  // Handle API request errors
  console.error("An error occurred during OpenAI request");
  console.error(error);
}
