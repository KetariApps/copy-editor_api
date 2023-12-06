import { Diff, SuggestionMessage } from "../workers/types.js";

export const groupSequentialDiffs = (
  diffs: Diff[],
  boundaries?: [string, number][]
) =>
  diffs.reduce(
    (acc, currentDiff) => {
      let update: Diff[][];
      const currentSequence = acc[acc.length - 1];
      const lastDiff = currentSequence[currentSequence.length - 1];

      // Are the operations capable of being combined?
      const likeOperations =
        (lastDiff.operation === "delete" &&
          currentDiff.operation === "delete") ||
        (lastDiff.operation === "insert" &&
          currentDiff.operation === "insert") ||
        lastDiff.operation === "replace" ||
        currentDiff.operation === "replace";

      // Are the diff positions sequential?
      const sequentialIndices =
        Math.abs(lastDiff.index.change - currentDiff.index.change) === 1;

      // Is this diff at a boundary position?
      const boundaryPosition = boundaries?.find(
        (bound) => bound[1] === currentDiff.index.change
      );

      if (likeOperations && sequentialIndices && !boundaryPosition) {
        update = [...acc.slice(0, -1), [...currentSequence, currentDiff]];
      } else {
        update = [...acc, [currentDiff]];
      }
      return update;
    },
    [[diffs[0]]]
  );

export const groupSuggestions = (rawSuggestions: SuggestionMessage[]) => {
  // console.debug(rawSuggestions);
  let groupedSuggestions: SuggestionMessage[] = [];
  try {
    for (let i = 0; i < rawSuggestions.length; i++) {
      const suggestion = rawSuggestions[i];
      if (i === 0) {
        groupedSuggestions.push(suggestion);
      } else {
        const lastSuggestion =
          groupedSuggestions[groupedSuggestions.length - 1];

        const noAnchorBoundary = !lastSuggestion.endingFootnote;
        const sameOperation = lastSuggestion.operation === suggestion.operation;

        if (noAnchorBoundary && sameOperation) {
          const { operation } = suggestion;
          let sequential: boolean;
          if (operation === "delete" || operation === "replace") {
            sequential =
              lastSuggestion.ref.index + lastSuggestion.ref.substring.length ===
              suggestion.ref.index;
          } else {
            sequential = lastSuggestion.ref.index === suggestion.ref.index;
          }
          if (sequential) {
            // console.debug(lastSuggestion.content, suggestion.content);
            const sequentialReplacement: SuggestionMessage = {
              ...lastSuggestion,
              content:
                operation === "delete"
                  ? ""
                  : lastSuggestion.content! + suggestion.content,
              ref: {
                ...lastSuggestion.ref,
                substring:
                  operation === "insert"
                    ? lastSuggestion.ref.substring
                    : lastSuggestion.ref.substring + suggestion.ref.substring,
              },
              endingFootnote: suggestion.endingFootnote,
            };
            groupedSuggestions.pop();
            groupedSuggestions.push(sequentialReplacement);
          } else {
            groupedSuggestions.push(suggestion);
          }
        } else {
          groupedSuggestions.push(suggestion);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  // console.debug(groupedSuggestions);

  return groupedSuggestions;
};
