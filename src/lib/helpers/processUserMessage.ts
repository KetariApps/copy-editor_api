import { encode } from "gpt-3-encoder";

// do any necessary pre-processing of the document
export default function processUserMessage(content: string) {
  // preprocess content
  // check the tokens in the content
  const tokens = encode(content);

  // do something based on the length -- ie, split paragraphs, summarization, etc

  // this is used in conjunction with the number of tokens in the original message to tune the max tokens in the response.
  // 0.1 means 10% more tokens than the request are allowed.
  const upperBuffer = 0.1;

  const max_tokens = Math.ceil(tokens.length * (1 + upperBuffer));

  // etc
  const processed = content;

  return { processed, tokens, max_tokens };
}
