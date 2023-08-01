import { Footnote } from "../types.js";

interface EditResponseMessage {
  type: "edit";
  originalVersion: string;
  editedVersion: string;
  footnotes?: Footnote[] | undefined;
  shouldGenerateComments: boolean;
}
