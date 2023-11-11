import { Anchor } from "../../lib/types.ts";

export interface RequestEditWorkerData {
  content: string;
  footnotes?: Anchor[];
  shouldGenerateComments: boolean;
  workerId: string;
}
export interface SequentialChange {
  comparisonIndex: number;
  token: number;
}
