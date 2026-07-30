import { STATUS_STYLES } from "../utils/constants.js";

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Active;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono uppercase tracking-wide ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
}
