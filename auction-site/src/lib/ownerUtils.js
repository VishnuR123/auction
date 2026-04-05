/**
 * @param {object | null | undefined} owner Owner document from API
 */
export function isUnsoldOwner(owner) {
  if (!owner || typeof owner !== "object") return false;
  const id = String(owner._id ?? "")
    .trim()
    .toLowerCase();
  const sn = String(owner.shortName ?? "")
    .trim()
    .toLowerCase();
  const nm = String(owner.name ?? "")
    .trim()
    .toLowerCase();
  return (
    id === "unsold" ||
    sn === "unsold" ||
    nm === "unsold" ||
    id.endsWith("-unsold")
  );
}
