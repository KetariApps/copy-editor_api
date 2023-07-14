import { decode, encode } from "gpt-3-encoder";

export default function splitPlaintextTokens(body: string) {
  const encodedTokens = encode(body);
  return encodedTokens.map((tkn) => decode([tkn]));
}
