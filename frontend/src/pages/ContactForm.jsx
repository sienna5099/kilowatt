import { useState } from "react";
import { api } from "../services/api";

const emptyForm = { name: "", email: "", phone: "", company: "", interested_service: "", message: "" };

export default function ContactForm({ publicPage = false, onBack }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createCustomer(form);
      setForm(emptyForm);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return <main className={`contact-page ${publicPage ? "contact-public" : ""}`}>
    <div className="contact-side-note"><a className="brand contact-brand" href="/"><span className="brand-mark">c</span><span>connect<span className="brand-light">crm</span></span></a><span className="contact-edition">CONTACT / LEAD FORM</span><div className="contact-aside-copy"><span className="eyebrow">A GOOD CONNECTION STARTS HERE</span><p>Tell us what you&apos;re working on. We&apos;ll make sure your enquiry finds the right person.</p><span className="contact-aside-foot">CONNECTCRM · CUSTOMER INTAKE</span></div></div>
    <section className="contact-form-area"><div className="contact-form-inner"><button className="back-link contact-back" onClick={onBack || (() => { window.location.href = "/"; })}>← <span>{publicPage ? "Back to ConnectCRM" : "Back to workspace"}</span></button><span className="eyebrow">WE&apos;RE LISTENING</span><h1>Let&apos;s build something useful.</h1><p className="form-intro">Share a few details and our team will follow up with you.</p>
      {submitted ? <div className="submission-success" role="status"><span className="success-mark">✓</span><span className="eyebrow">ENQUIRY RECEIVED</span><h2>Thanks for reaching out.</h2><p>Your information is safely in our CRM. A member of our team can follow up shortly.</p><button className="button button-primary" onClick={() => setSubmitted(false)}>Send another enquiry</button></div> : <form className="contact-form" onSubmit={submit}>
        <div className="form-grid"><label><span>Your name <i>*</i></span><input name="name" autoComplete="name" required maxLength="100" value={form.name} onChange={updateField} placeholder="e.g. Rahul Sharma" /></label><label><span>Email address <i>*</i></span><input name="email" type="email" autoComplete="email" required maxLength="150" value={form.email} onChange={updateField} placeholder="you@company.com" /></label><label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" maxLength="20" value={form.phone} onChange={updateField} placeholder="+1 (555) 000-0000" /></label><label><span>Company</span><input name="company" autoComplete="organization" maxLength="100" value={form.company} onChange={updateField} placeholder="Your company" /></label><label className="form-full"><span>Interested service</span><select name="interested_service" value={form.interested_service} onChange={updateField}><option value="">Choose a service</option><option>Website Development</option><option>CRM Integration</option><option>Digital Strategy</option><option>Other</option></select></label><label className="form-full"><span>How can we help?</span><textarea name="message" rows="4" maxLength="2000" value={form.message} onChange={updateField} placeholder="Tell us a little about what you need…" /></label></div>
        {error && <div className="notice notice-error" role="alert">{error}</div>}<button className="button button-primary submit-button" disabled={submitting}>{submitting ? "Sending enquiry…" : "Send enquiry"}<span>↗</span></button><small className="privacy-note">Your details are stored securely in ConnectCRM and used only to respond to your enquiry.</small>
      </form>}
    </div></section>
  </main>;
}