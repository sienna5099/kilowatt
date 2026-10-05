import { useEffect, useState } from "react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const stages = ["New", "Contacted", "Qualified", "Won", "Lost"];
const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";
}

export default function Dashboard({ onNavigate, onSelectCustomer }) {
  const [dashboard, setDashboard] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getCustomers()])
      .then(([summary, customerRows]) => { setDashboard(summary); setCustomers(customerRows); })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const counts = stages.map((status) => ({
    status,
    count: customers.filter((customer) => customer.status === status).length,
  }));
  const maxStage = Math.max(1, ...counts.map((stage) => stage.count));

  return (
    <>
      <div className="page-heading dashboard-heading">
        <div><span className="eyebrow">{todayLabel}</span><h1>Good work starts with a clear view.</h1><p>Your team&apos;s customer pipeline, at a glance.</p></div>
        <button className="button button-primary" onClick={() => onNavigate("contact")}>＋ New enquiry</button>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {!dashboard && !error ? <div className="loading-state">Loading live CRM data…</div> : (
        <>
          <section className="stat-grid" aria-label="CRM totals">
            <article className="stat-card"><span>Total customers</span><strong>{Number(dashboard?.totalCustomers || 0).toLocaleString()}</strong><small>Across your workspace</small><span className="stat-index">01</span></article>
            <article className="stat-card"><span>New leads</span><strong>{Number(dashboard?.newLeads || 0).toLocaleString()}</strong><small>Ready for first contact</small><span className="stat-index">02</span></article>
            <article className="stat-card"><span>Qualified</span><strong>{Number(dashboard?.qualifiedLeads || 0).toLocaleString()}</strong><small>Active opportunities</small><span className="stat-index">03</span></article>
            <article className="stat-card"><span>Won leads</span><strong>{Number(dashboard?.wonLeads || 0).toLocaleString()}</strong><small>Closed opportunities</small><span className="stat-index">04</span></article>
            <article className="stat-card stat-card-accent"><span>Follow-ups</span><strong>{Number(dashboard?.followups || 0).toLocaleString()}</strong><small>Still to be completed</small><span className="stat-index">05</span></article>
          </section>
          <section className="dashboard-lower">
            <article className="panel pipeline-panel">
              <div className="panel-heading"><div><span className="eyebrow">PIPELINE</span><h2>Lead stages</h2></div><button className="text-button" onClick={() => onNavigate("leads")}>Open pipeline <span>↗</span></button></div>
              <div className="stage-chart">
                {counts.map(({ status, count }) => (
                  <div className="stage-row" key={status}>
                    <span>{status}</span><div className="stage-track"><div className={`stage-fill stage-fill-${status.toLowerCase()}`} style={{ width: `${Math.max(count ? 10 : 0, (count / maxStage) * 100)}%` }} /></div><strong>{count}</strong>
                  </div>
                ))}
              </div>
              <div className="chart-caption"><span className="chart-dot" />Customer records by current status</div>
            </article>
            <article className="panel activity-panel">
              <div className="panel-heading"><div><span className="eyebrow">WHAT&apos;S HAPPENING</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => onNavigate("activity")}>See all <span>↗</span></button></div>
              {dashboard?.activity?.length ? <div className="activity-list compact-list">{dashboard.activity.map((item) => (
                <button className="activity-item" key={item.id} onClick={() => onSelectCustomer(item.customer_id)}>
                  <span className="activity-dot" /><span className="activity-copy"><strong>{item.customer_name}</strong><span>{item.description}</span></span><time>{formatDate(item.created_at)}</time>
                </button>
              ))}</div> : <div className="empty-state compact-empty"><span className="empty-mark">AC</span><strong>No activity yet</strong><span>New enquiries and customer updates will show here.</span></div>}
            </article>
          </section>
          <section className="panel recent-customers">
            <div className="panel-heading"><div><span className="eyebrow">YOUR RELATIONSHIPS</span><h2>Recently added customers</h2></div><button className="text-button" onClick={() => onNavigate("customers")}>All customers <span>↗</span></button></div>
            {customers.length ? <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Company</th><th>Interested in</th><th>Status</th><th>Added</th></tr></thead><tbody>{customers.slice(0, 5).map((customer) => <tr key={customer.id} onClick={() => onSelectCustomer(customer.id)}><td><strong>{customer.name}</strong><small>{customer.email}</small></td><td>{customer.company || "—"}</td><td>{customer.interested_service || "—"}</td><td><StatusBadge status={customer.status} /></td><td>{formatDate(customer.created_at)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>Your customer list is clear.</strong><span>Send your first enquiry through the public contact form.</span><button className="button button-secondary" onClick={() => onNavigate("contact")}>Open contact form</button></div>}
          </section>
        </>
      )}
    </>
  );
}