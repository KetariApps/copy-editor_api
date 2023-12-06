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

  const anchorPositions = message.footnotes?.map((anchor) => {
    const ref = `|${anchor.id}|`;
    const index = message.editedVersion.indexOf(ref);
    return index;
  });

  const diffSequence = lDiggityDiff(
    originalWithoutAnchorRefs,
    editsWithoutAnchorRefs
  );

  const chunkedDiffs = anchorPositions
    ? chunkArrayAtIndices(diffSequence, anchorPositions)
    : [diffSequence];

  console.log(anchorPositions, chunkedDiffs.length);

  const suggestions = chunkedDiffs.flatMap((chunk) =>
    groupSuggestions(
      chunk.map((diff) => diffToSuggestion(diff, originalWithoutAnchorRefs))
    )
  );

  return {
    type: "batch-suggestion",
    suggestions,
  };
};
