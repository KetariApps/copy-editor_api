import { Footnote } from "../../lib/types.ts";

export interface RequestEditWorkerData {
  content: string;
  footnotes?: Footnote[];
  shouldGenerateComments: boolean;
  workerId: string;
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}
