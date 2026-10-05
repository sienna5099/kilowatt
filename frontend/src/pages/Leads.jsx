import { useEffect, useState } from "react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const stages = ["New", "Contacted", "Qualified", "Won", "Lost"];

export default function Leads({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  function loadLeads() {
    api.getCustomers().then(setCustomers).catch((requestError) => setError(requestError.message));
  }

  useEffect(() => { loadLeads(); }, []);

  async function changeStatus(id, status) {
    setSavingId(id);
    setError("");
    try {
      const updated = await api.updateCustomerStatus(id, status);
      setCustomers((current) => current.map((customer) => customer.id === id ? updated : customer));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">SALES PROCESS</span><h1>Lead pipeline</h1><p>Move opportunities forward. Every stage change is recorded.</p></div><span className="record-count">{customers.length} leads</span></div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel table-panel"><div className="pipeline-legend">{stages.map((stage) => <span key={stage}><StatusBadge status={stage} /> <small>{customers.filter((customer) => customer.status === stage).length}</small></span>)}</div>
        {customers.length ? <div className="table-wrap"><table><thead><tr><th>Lead</th><th>Interested in</th><th>Company</th><th>Current stage</th><th>Update stage</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><button className="customer-link" onClick={() => onSelectCustomer(customer.id)}><strong>{customer.name}</strong><small>{customer.email}</small></button></td><td>{customer.interested_service || "—"}</td><td>{customer.company || "—"}</td><td><StatusBadge status={customer.status} /></td><td><select aria-label={`Update ${customer.name} status`} disabled={savingId === customer.id} value={customer.status || "New"} onChange={(event) => changeStatus(customer.id, event.target.value)}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>No leads to show</strong><span>Website enquiries will enter the pipeline as new leads.</span></div>}
      </section>
    </>
  );
}