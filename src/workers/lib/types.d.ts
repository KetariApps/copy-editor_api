import { CommentMessage } from "../generateComments/types.js";
import { SuggestionMessage } from "../handleEditV2/types.js";
import { EditResponseMessage } from "../types.js";

export interface DoneMessage {
  type: "done";
  workerId: string;
}

export type WorkerMessage =
  | EditResponseMessage
  | SuggestionMessage
  | CommentMessage
  | DoneMessage
  | "error";
