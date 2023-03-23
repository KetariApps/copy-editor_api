export default function diff(base, payload) {
  return base.map((tkn, i) => {
    return {
      base: tkn,
      payload: payload[i],
      change: tkn !== payload[i],
    };
  });
}
