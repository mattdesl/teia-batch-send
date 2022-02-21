export function shortAddress(address) {
  if (!address) return "";
  return [address.slice(0, 7), "...", address.slice(address.length - 4)].join(
    ""
  );
}
