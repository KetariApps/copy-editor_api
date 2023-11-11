import { Diff } from "../types.js";

export default function lDiggityDiff(a: string, b: string): Diff[] {
  const diffs: Diff[] = [];
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    for (let j = 0; j <= b.length; j++) {
      if (Math.min(i, j) === 0) dp[i][j] = Math.max(i, j);
      else {
        const deletion = dp[i - 1][j] + 1;
        const insertion = dp[i][j - 1] + 1;
        const replacement = dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
        const operation = Math.min(deletion, insertion, replacement);

        dp[i][j] = Math.min(operation);
      }
    }
  }

  // Backtracking to find the path
  let i = a.length;
  let j = b.length;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j - 1] + 1) {
      diffs.push({
        new: b[j - 1],
        operation: "replace",
        index: { old: i - 1, new: j - 1 },
      });
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] + 1) {
      diffs.push({
        new: "",
        operation: "delete",
        index: { old: i - 1, new: j - 1 },
      });
      i--;
    } else if (dp[i][j] === dp[i][j - 1] + 1) {
      diffs.push({
        new: b[j - 1],
        operation: "insert",
        index: { old: i - 1, new: j - 1 },
      });
      j--;
    }
  }

  // Take care of the remaining operations
  while (i > 0) {
    diffs.push({
      new: "",
      operation: "delete",
      index: { old: i - 1, new: j - 1 },
    });
    i--;
  }
  while (j > 0) {
    diffs.push({
      new: b[j - 1],
      operation: "insert",
      index: { old: i - 1, new: j - 1 },
    });
    j--;
  }

  return diffs.reverse(); // Reverse to get the correct order of operations
}
