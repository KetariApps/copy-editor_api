import { CommentMessage } from "../generateComments/types.ts";
import { SuggestionMessage } from "../handleEditV2/types.ts";
import { EditResponseMessage } from "../types.ts";

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
