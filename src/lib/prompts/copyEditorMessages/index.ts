import { ChatCompletionRequestMessage } from "openai";
import globalMessages from "../globalMessages.js";
import editTextMessage from "./editTextMessage.js";
import preserveFootnotesMessage from "./preserveFootnotesMessage.js";

const copyEditorMessages: ChatCompletionRequestMessage[] = [
  ...globalMessages,
  editTextMessage,
  preserveFootnotesMessage,
];
export default copyEditorMessages;
