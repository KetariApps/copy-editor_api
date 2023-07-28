import { decode } from "gpt-3-encoder";
import type { Footnote, Message, SequentialChange } from "./types.d.ts";

const diffSuggestion = (
  encodedOriginal: number[],
  encodedSuggestions: number[][],
  footnotes: Footnote[] | undefined,
  callback: (arg1: Message) => void
) => {
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
        newToken !== originalToken || typeof originalToken === "undefined";

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
          const endingFootnote =
            typeof footnotes === "undefined"
              ? undefined
              : footnotes[suggestionIndex];
          const userMessage: Message = {
            type: "suggestion",
            suggestion: decode(sequentialChanges.map(({ token }) => token)),
            originalSubstring: decode(
              encodedOriginal.slice(
                sequentialChanges[0].comparisonIndex,
                endOfSliceIndex
              )
            ),
            insertionIndex: decode(
              encodedOriginal.slice(0, sequentialChanges[0].comparisonIndex)
            ).length,
            endingFootnote,
          };
          // console.log("Suggestion to user:\n\n", userMessage);
          callback(userMessage);
        }
      } else {
        if (sequentialChanges.length > 0) {
          // collect the changes and send them to the user
          const userMessage: Message = {
            type: "suggestion",
            suggestion: decode(sequentialChanges.map(({ token }) => token)),
            originalSubstring: decode(
              encodedOriginal.slice(
                sequentialChanges[0].comparisonIndex,
                comparisonIndex
              )
            ),
            insertionIndex: decode(
              encodedOriginal.slice(0, sequentialChanges[0].comparisonIndex)
            ).length,
          };
          // console.log("Suggestion to user:\n\n", userMessage);
          callback(userMessage);
        } else {
        }
        // reset sequentialChanges
        sequentialChanges = [];
      }
    }

    suggestionOffset = suggestionOffset + encodedSuggestion.length - 1;
  }
};

export default diffSuggestion;
