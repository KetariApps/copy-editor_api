import {
  BatchSuggestionMessage,
  EditResponseMessage,
} from "../workers/types.js";
import { chunkArrayAtIndices } from "./chunkArrayAtIndices.js";
import { diffToSuggestion } from "./diffToSuggestion.js";
import { groupSuggestions } from "./groupSequentialDiffs.js";
import lDiggityDiff from "./lDiggityDiff.js";
import removeSubstrings from "./removeSubstrings.js";

export const handleEditMessage = (
  message: EditResponseMessage
): BatchSuggestionMessage => {
  const originalWithoutAnchorRefs = message.footnotes
    ? removeSubstrings(
        message.originalVersion,
        message.footnotes.map(({ id }) => `|${id}|`)
      )
    : message.originalVersion;

  const editsWithoutAnchorRefs = message.footnotes
    ? removeSubstrings(
        message.editedVersion,
        message.footnotes.map(({ id }) => `|${id}|`)
      )
    : message.editedVersion;

  const anchorPositions = message.footnotes?.map((anchor): [string, number] => {
    const ref = anchor.id;
    const index = message.editedVersion.indexOf(ref);
    return [ref, index];
  });

  const diffSequence = lDiggityDiff(
    originalWithoutAnchorRefs,
    editsWithoutAnchorRefs
  );

  const chunkedDiffs = anchorPositions
    ? chunkArrayAtIndices(
        diffSequence,
        anchorPositions.map((anchor) => anchor[1])
      )
    : [diffSequence];

  console.log(anchorPositions, chunkedDiffs.length);

  const suggestions = chunkedDiffs.flatMap((chunk, i) =>
    groupSuggestions(
      chunk.map((diff, j) => {
        let suggestion = diffToSuggestion(diff, originalWithoutAnchorRefs);

        // add the anchor to the last suggestion of this group if an should exist at that position
        if (anchorPositions && j === chunk.length - 1) {
          suggestion = {
            ...suggestion,
            endingFootnote: message.footnotes?.find(
              ({ id }) => id === anchorPositions[i][0]
            ),
          };
        }

        return suggestion;
      })
    )
  );

  return {
    type: "batch-suggestion",
    suggestions,
  };
};
