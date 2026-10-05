import { useEffect, useState } from "react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export default function Customers({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      api.getCustomers({ search, status }).then(setCustomers).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [search, status]);

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">RELATIONSHIPS</span><h1>Customers</h1><p>Every enquiry, all in one place.</p></div><span className="record-count">{customers.length} {customers.length === 1 ? "record" : "records"}</span></div>
      <section className="panel table-panel">
        <div className="table-toolbar"><label className="search-field"><span>⌕</span><input aria-label="Search customers" placeholder="Search name, email, company" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="filter-field"><span>Status</span><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{["New", "Contacted", "Qualified", "Won", "Lost"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        {loading ? <div className="loading-state">Loading customers…</div> : customers.length ? <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Phone</th><th>Company</th><th>Status</th><th>Interested service</th><th>Created</th><th /></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id} onClick={() => onSelectCustomer(customer.id)}><td><strong>{customer.name}</strong><small>{customer.email}</small></td><td>{customer.phone || "—"}</td><td>{customer.company || "—"}</td><td><StatusBadge status={customer.status} /></td><td>{customer.interested_service || "—"}</td><td>{formatDate(customer.created_at)}</td><td><span className="row-arrow">↗</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-mark">CU</span><strong>{search || status ? "No matching customers" : "No customers yet"}</strong><span>{search || status ? "Try a different search or clear the status filter." : "A submitted contact form will appear here automatically."}</span></div>}
      </section>
    </>
  );
}