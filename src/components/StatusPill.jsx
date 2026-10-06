import { statusClass } from '../lib/format.js';

export default function StatusPill({ status }) {
  return <span className={`status-pill ${statusClass(status)}`}>{status}</span>;
}
