import { Diff } from "../types.js";

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
        Math.abs(lastDiff.index.new - currentDiff.index.new) === 1;

      // Is this diff at a boundary position?
      const boundaryPosition = boundaries?.find(
        (bound) => bound[1] === currentDiff.index.new
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
