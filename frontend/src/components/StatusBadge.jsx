export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${String(status || 'new').toLowerCase().replaceAll(' ', '-')}`}>{status || 'New'}</span>
}