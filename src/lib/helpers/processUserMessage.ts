import { encode } from "gpt-3-encoder";

// do any necessary pre-processing of the document
export default function processUserMessage(content: string) {
  // preprocess content
  // check the tokens in the content
  const tokens = encode(content);

  // do something based on the length -- ie, split paragraphs, summarization, etc

  // etc
  const processed = content;

  return { processed, tokens };
}
