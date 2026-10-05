import { useEffect, useState } from "react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

function formatDate(value) {
  return value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export default function Followups({ onSelectCustomer }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  function load() {
    api.getFollowups().then(setItems).catch((requestError) => setError(requestError.message));
  }

  useEffect(() => { load(); }, []);

  async function complete(item) {
    setError("");
    try {
      await api.updateFollowupStatus(item.id, "Completed");
      setItems((current) => current.map((followup) => followup.id === item.id ? { ...followup, status: "Completed" } : followup));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">STAY IN TOUCH</span><h1>Follow-ups</h1><p>Keep your next conversation from slipping through.</p></div><span className="record-count">{items.filter((item) => item.status !== "Completed").length} open</span></div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel table-panel">{items.length ? <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Follow-up date</th><th>Note</th><th>Status</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><button className="customer-link" onClick={() => onSelectCustomer(item.customer_id)}><strong>{item.customer_name}</strong><small>{item.customer_email}</small></button></td><td>{formatDate(item.followup_date)}</td><td className="followup-note">{item.note}</td><td><StatusBadge status={item.status} /></td><td>{item.status !== "Completed" && <button className="button button-small button-secondary" onClick={() => complete(item)}>Mark complete</button>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-mark">FU</span><strong>No follow-ups scheduled</strong><span>Open a customer profile to schedule the next step.</span></div>}</section>
    </>
  );
}