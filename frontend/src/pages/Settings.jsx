import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Settings() {
  const [connection, setConnection] = useState("checking");
  useEffect(() => {
    api.checkHealth().then(() => setConnection("connected")).catch(() => setConnection("offline"));
  }, []);

  return <>
    <div className="page-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Settings</h1><p>Connection and integration status for this demo.</p></div></div>
    <section className="panel settings-panel"><div className="settings-row"><div><strong>ConnectCRM API</strong><span>Node.js · Express · REST</span></div><span className={`connection-state connection-${connection}`}><i />{connection === "checking" ? "Checking" : connection === "connected" ? "Connected" : "Unavailable"}</span></div><div className="settings-row"><div><strong>Customer storage</strong><span>MySQL · connectcrm</span></div><span className="settings-caption">Configured on the backend</span></div><div className="settings-row"><div><strong>AI assistant</strong><span>Customer-aware, rule-based</span></div><span className="demo-tag">DEMO MODE</span></div><div className="settings-row"><div><strong>External communication</strong><span>Email, WhatsApp and calls are not connected</span></div><span className="settings-caption">No messages are sent</span></div></section>
  </>;
}