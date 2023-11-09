import { Diff } from "../types.js";

export const groupSequentialDiffs = (
  diffs: Diff[],
  boundaries?: [string, number][]
) =>
  diffs.reduce(
    (a, b) => {
      let update: Diff[][];
      const currentSequence = a[a.length - 1];
      const lastDiff = currentSequence[currentSequence.length - 1];
      const likeOperations =
        (lastDiff.operation === "delete" && b.operation === "delete") ||
        (lastDiff.operation === "insert" && b.operation === "insert") ||
        lastDiff.operation === "replace" ||
        b.operation === "replace";
      const sequentialIndices =
        Math.abs(lastDiff.index.new - b.index.new) === 1;
      if (boundaries?.find((bound) => bound[1] === b.index.new)) {
        update = [...a, [b]];
      } else if (likeOperations && sequentialIndices) {
        const mergedCurrentSequence = [...currentSequence, b];
        update = [...a.slice(0, -1), mergedCurrentSequence];
      } else {
        update = [...a, [b]];
      }
      return update;
    },
    [[diffs[0]]]
  );
