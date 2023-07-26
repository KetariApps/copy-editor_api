import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { global } from "./sysFoundations.js";

const editExample = `Original text:
Cyclone Mocha brought some additional uncertainty to the agriculture sector. The storm hit in Sittwe, the capital of Rakhine, and then moved northeast through Chin, Magway, Sagaing and Kachin. The farmers' livelihoods were severely affected due to the loss of livestock. In early May 2023, in Magway, farmers had already planted green gram and sesame but damage was caused to the crops through extensive flooding, meaning much was lost. Cash crops like sesame and green gram are typically cultivated by farmers to supplement their families' diets and generate income.
Edited:
Cyclone Mocha added further uncertainty to the agricultural sector. The storm hit Sittwe, the capital of Rakhine, before moving northeast through Chin, Magway, Sagaing, and Kachin. The loss of livestock severely impacted farmers’ livelihoods. In Magway, farmers had already planted green gram and sesame in early May 2023, but extensive flooding destroyed much of the crop. Farmers commonly grow such cash crops to supplement their families’ diets and generate income.`;

export const editText: ChatCompletionRequestMessage = {
  role: ChatCompletionRequestMessageRoleEnum.System,
  content: `Your task is to edit any text provided to you with the following goals:
  
  The edited text clearly conveys the author's intended message.
  The edited text retains all essential information from the original text.
  The edited text removes unnecessary verbosity while staying consistent to the author's voice.

  Example:
  
 ${editExample}`,
};
export const preserveFootnotes = {
  role: ChatCompletionRequestMessageRoleEnum.System,
  content: `Footnotes will be referenced in the text by a uid which references a matching footnote body. When editing the text, ensure the reference uid is in the same semantic position, and in the same format, in the edited text.`,
};
export const copyEditorMessages: ChatCompletionRequestMessage[] = [
  ...global,
  editText,
  preserveFootnotes,
];
