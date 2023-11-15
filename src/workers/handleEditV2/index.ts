import { workerData } from "worker_threads";
import sendMessageToMainProcess from "../lib/sendMessageToMainProcess.js";
import { HandleEditWorkerData, Diff, SuggestionMessage } from "./types.js";
import lDiggityDiff from "./lib/lDiggityDiff.js";
import removeSubstrings from "./lib/removeSubstrings.js";
import { groupSequentialDiffs } from "./lib/groupSequentialDiffs.js";

const {
  originalVersion,
  editedVersion,
  anchors,
  workerId,
}: HandleEditWorkerData = workerData;

const originalWithoutAnchorRefs = anchors
  ? removeSubstrings(
      originalVersion,
      anchors.map(({ id }) => `|${id}|`)
    )
  : originalVersion;
/**
 * 1.a
 * Get the set of minimal changes required to transform the original version to the edited version
 */
const changeSequence: Diff[] = lDiggityDiff(
  originalWithoutAnchorRefs,
  editedVersion
);

// find the positions of the anchors in the content
const anchorPositions = anchors?.map((anchor): [string, number] => {
  const ref = `|${anchor.id}|`;
  const index = editedVersion.indexOf(ref);
  return [ref, index];
});
/**
 * 2.a
 * Combine the character suggestions into grouped sequential changes
 */
const groupedSequentialDiffs: Diff[][] = groupSequentialDiffs(
  changeSequence,
  anchorPositions
);

/**
 * 4.a
 * Group diffs and format the changes as suggestion messages and send to the main process
 */
groupedSequentialDiffs.forEach((diffSequence) => {
  let operation: SuggestionMessage["operation"];
  let refSubstring: SuggestionMessage["ref"]["substring"];
  let refIndex: SuggestionMessage["ref"]["index"];
  let content: SuggestionMessage["content"];

  if (diffSequence.every(({ operation }) => operation === "insert")) {
    operation = "insert";
    refIndex = 0;
    /**
     * Insertions will insert after the matched range.
     * Ref.substring should allow word.search match the entire string before the insertion
     * This will fail if an insertion is neccessary at position 0
     */
    refSubstring = originalWithoutAnchorRefs.slice(
      refIndex,
      diffSequence[0].index.old
    );
    content = diffSequence.map((diff) => diff.new).join("");
  } else {
    refIndex = diffSequence[0].index.old;
    /**
     * Replacements and Deletions will use range.replace with the matched range.
     * Ref.substring should allow word.search match the entire string that should be replaced
     * Slice from refIndex to the number of non-insertion operations that should be performed
     */
    refSubstring = originalWithoutAnchorRefs.slice(
      refIndex,
      refIndex +
        diffSequence.filter(({ operation }) => operation !== "insert").length
    );
    if (diffSequence.every(({ operation }) => operation === "delete")) {
      operation = "delete";
      content = null;
    } else {
      operation = "replace";
      content = diffSequence.map((diff) => diff.new).join("");
    }
  }

  const message: SuggestionMessage = {
    type: "suggestion",
    operation,
    content,
    ref: { index: refIndex, substring: refSubstring },
  };

  // const message: SuggestionMessage = formatChangeAsMessage(change);
  sendMessageToMainProcess(message);
});

sendMessageToMainProcess({ type: "done", workerId });
