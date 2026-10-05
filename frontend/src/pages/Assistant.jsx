import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Assistant() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    api.getCustomers().then((rows) => { setCustomers(rows); if (rows.length) setCustomerId(String(rows[0].id)); }).catch((requestError) => setError(requestError.message));
  }, []);

  async function generate() {
    if (!customerId) return;
    setLoading(true);
    setError("");
    setShowEmail(false);
    try {
      setResult(await api.getAssistantContext(customerId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">CONTROLLED DEMO MODE</span><h1>AI follow-up assistant</h1><p>Customer context in. Helpful next steps out. Nothing sends automatically.</p></div><span className="demo-tag">DEMO MODE</span></div>
      <div className="assistant-layout">
        <section className="panel assistant-controls"><span className="assistant-monogram">AI</span><h2>Start with a customer</h2><p>The assistant uses that customer&apos;s saved profile and recent interactions to shape a useful follow-up.</p><label className="field-label" htmlFor="assistant-customer">Customer</label><select id="assistant-customer" value={customerId} onChange={(event) => { setCustomerId(event.target.value); setResult(null); }}><option value="">Choose a customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name} · {customer.company || customer.email}</option>)}</select><button className="button button-primary button-wide" disabled={!customerId || loading} onClick={generate}>{loading ? "Reviewing customer…" : "Generate suggestion"}</button>{error && <div className="notice notice-error" role="alert">{error}</div>}<div className="assistant-safety"><strong>Human in the loop</strong><span>Suggestions are drafts only. Review and confirm any outreach yourself.</span></div></section>
        <section className="assistant-output" aria-live="polite">{result ? <>
          <div className="assistant-output-head"><span className="eyebrow">CUSTOMER SNAPSHOT</span><span className="demo-tag">RULE-BASED DEMO</span></div>
          <article className="insight-block"><span className="insight-label">SUMMARY</span><p>{result.summary}</p><small>{result.interactions.length ? `Latest touchpoint: ${result.interactions[0].type}` : "No activity history yet"}</small></article>
          <article className="insight-block suggestion-block"><span className="insight-label">SUGGESTED NEXT STEP</span><p>{result.suggestion}</p><button className="button button-secondary" onClick={() => setShowEmail((visible) => !visible)}>{showEmail ? "Hide email draft" : "Generate follow-up email"}</button></article>
          {showEmail && <article className="email-draft"><div className="insight-label">EMAIL DRAFT · NOT SENT</div><pre>{result.emailDraft}</pre></article>}
        </> : <div className="assistant-placeholder"><span className="placeholder-index">01 / INSIGHT</span><div className="placeholder-rule" /><p>Select a customer to see a grounded summary and a thoughtful next step.</p><span className="placeholder-signature">CONNECTCRM / SALES INTELLIGENCE</span></div>}</section>
      </div>
      <p className="assistant-disclaimer">Demo mode uses saved CRM records and transparent rules. No external AI service is configured and no email, call, or message is sent.</p>
    </>
  );
}