import { useEffect, useState } from "react";
import { api } from "../services/api";

function formatDate(value) {
  return value ? new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
}

export default function Activity({ onSelectCustomer }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { api.getActivity().then(setItems).catch((requestError) => setError(requestError.message)); }, []);

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">CUSTOMER HISTORY</span><h1>Activity</h1><p>A shared record of every customer touchpoint.</p></div><span className="record-count">{items.length} events</span></div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel activity-feed-panel">{items.length ? <div className="activity-feed">{items.map((item) => <article className="feed-item" key={item.id}><span className="feed-marker">{item.type.slice(0, 2).toUpperCase()}</span><div><div className="feed-title"><strong>{item.type}</strong><span>with <button className="inline-link" onClick={() => onSelectCustomer(item.customer_id)}>{item.customer_name}</button></span></div><p>{item.description}</p></div><time>{formatDate(item.created_at)}</time></article>)}</div> : <div className="empty-state"><span className="empty-mark">AC</span><strong>No activity recorded</strong><span>Form submissions, notes, calls and stage changes appear here.</span></div>}</section>
    </>
  );
}