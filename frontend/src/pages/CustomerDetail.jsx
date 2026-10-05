import { useEffect, useState } from "react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const stages = ["New", "Contacted", "Qualified", "Won", "Lost"];

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, includeTime
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" });
}

export default function CustomerDetail({ customerId, onBack, onNavigate }) {
  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [followupNote, setFollowupNote] = useState("");

  async function loadCustomer() {
    const [customerRecord, timeline, allFollowups] = await Promise.all([
      api.getCustomer(customerId), api.getInteractions(customerId), api.getFollowups(),
    ]);
    setCustomer(customerRecord);
    setInteractions(timeline);
    setFollowups(allFollowups.filter((item) => String(item.customer_id) === String(customerId)));
  }

  useEffect(() => {
    let active = true;
    Promise.all([api.getCustomer(customerId), api.getInteractions(customerId), api.getFollowups()])
      .then(([customerRecord, timeline, allFollowups]) => {
        if (!active) return;
        setCustomer(customerRecord);
        setInteractions(timeline);
        setFollowups(allFollowups.filter((item) => String(item.customer_id) === String(customerId)));
      })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [customerId]);

  async function updateStatus(event) {
    setSaving(true);
    setError("");
    try {
      setCustomer(await api.updateCustomerStatus(customerId, event.target.value));
      setInteractions(await api.getInteractions(customerId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function recordOutreach(type) {
    setError("");
    setNotice("");
    try {
      await api.addInteraction(customerId, { type, description: `${type} outreach prepared in demo mode. No message or call was sent.` });
      setInteractions(await api.getInteractions(customerId));
      setNotice(`Demo mode: no ${type.toLowerCase()} was sent or placed. The planned outreach was added to this timeline.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addNote(event) {
    event.preventDefault();
    setError("");
    try {
      await api.addInteraction(customerId, { type: "Note", description: note });
      setNote("");
      setInteractions(await api.getInteractions(customerId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addFollowup(event) {
    event.preventDefault();
    setError("");
    try {
      await api.createFollowup(customerId, { followup_date: followupDate, note: followupNote });
      setFollowupDate("");
      setFollowupNote("");
      await loadCustomer();
      setNotice("Follow-up added to the schedule.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!customer && !error) return <div className="loading-state">Loading customer profile…</div>;
  if (!customer) return <div className="notice notice-error" role="alert">{error}<button className="text-button" onClick={onBack}>Back to customers</button></div>;

  return <>
    <button className="back-link" onClick={onBack}>← <span>All customers</span></button>
    <div className="profile-heading"><div className="profile-identity"><span className="large-avatar">{customer.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><span className="eyebrow">CUSTOMER PROFILE · ADDED {formatDate(customer.created_at)}</span><h1>{customer.name}</h1><p>{customer.company || "Independent customer"}{customer.interested_service ? ` · Interested in ${customer.interested_service}` : ""}</p></div></div><div className="profile-status"><StatusBadge status={customer.status} /><label className="visually-hidden" htmlFor="profile-status">Lead status</label><select id="profile-status" disabled={saving} value={customer.status || "New"} onChange={updateStatus}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></div></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}{notice && <div className="notice notice-success" role="status">{notice}</div>}
    <div className="profile-grid">
      <div className="profile-main">
        <section className="panel profile-panel"><div className="panel-heading"><div><span className="eyebrow">CUSTOMER HISTORY</span><h2>Activity timeline</h2></div><span className="record-count">{interactions.length} events</span></div>
          <form className="note-composer" onSubmit={addNote}><label className="visually-hidden" htmlFor="customer-note">Add a note</label><input id="customer-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note about this customer…" required /><button className="button button-small button-primary">Add note</button></form>
          {interactions.length ? <div className="detail-timeline">{interactions.map((item) => <article className="timeline-item" key={item.id}><span className="timeline-marker">{item.type.slice(0, 2).toUpperCase()}</span><div className="timeline-content"><div><strong>{item.type}</strong><time>{formatDate(item.created_at, true)}</time></div><p>{item.description}</p></div></article>)}</div> : <div className="empty-state timeline-empty"><strong>No activity yet</strong><span>The first website enquiry will be recorded here.</span></div>}
        </section>
        <section className="panel profile-panel"><div className="panel-heading"><div><span className="eyebrow">NEXT STEPS</span><h2>Follow-ups</h2></div><button className="text-button" onClick={() => onNavigate("followups")}>View schedule <span>↗</span></button></div>
          <form className="followup-composer" onSubmit={addFollowup}><label><span>Follow-up date</span><input type="date" required value={followupDate} onChange={(event) => setFollowupDate(event.target.value)} /></label><label className="followup-note-field"><span>Note</span><input required value={followupNote} onChange={(event) => setFollowupNote(event.target.value)} placeholder="What should happen next?" /></label><button className="button button-small button-primary">Schedule</button></form>
          {followups.length ? <div className="profile-followups">{followups.map((item) => <div className="profile-followup" key={item.id}><div><strong>{item.note}</strong><span>{formatDate(item.followup_date)}</span></div><StatusBadge status={item.status} /></div>)}</div> : <p className="subtle-note">No follow-ups scheduled for this customer.</p>}
        </section>
      </div>
      <aside className="profile-rail">
        <section className="panel contact-panel"><span className="eyebrow">CONTACT DETAILS</span><h2>Reach out</h2><dl className="contact-details"><div><dt>Email</dt><dd><a href={`mailto:${customer.email}`}>{customer.email}</a></dd></div><div><dt>Phone</dt><dd>{customer.phone ? <a href={`tel:${customer.phone}`}>{customer.phone}</a> : "Not provided"}</dd></div><div><dt>Company</dt><dd>{customer.company || "Not provided"}</dd></div><div><dt>Interested service</dt><dd>{customer.interested_service || "Not specified"}</dd></div></dl><div className="communication-actions"><span className="eyebrow">COMMUNICATION · DEMO</span><div><button className="button button-secondary" onClick={() => recordOutreach("Email")}>Email</button><button className="button button-secondary" onClick={() => recordOutreach("WhatsApp")}>WhatsApp</button><button className="button button-secondary" onClick={() => recordOutreach("Call")}>Call</button></div><small>These actions log a planned touchpoint only; nothing is sent.</small></div></section>
        <section className="panel message-panel"><span className="eyebrow">ORIGINAL ENQUIRY</span><h2>Message</h2><p>{customer.message || "No message was included."}</p></section>
      </aside>
    </div>
  </>;
}