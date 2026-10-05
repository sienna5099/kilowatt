const navigation = [
  { id: "dashboard", label: "Overview", mark: "OV" },
  { id: "customers", label: "Customers", mark: "CU" },
  { id: "leads", label: "Lead pipeline", mark: "LP" },
  { id: "activity", label: "Activity", mark: "AC" },
  { id: "followups", label: "Follow-ups", mark: "FU" },
  { id: "assistant", label: "AI assistant", mark: "AI" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("dashboard"); }}>
        <span className="brand-mark">c</span>
        <span>connect<span className="brand-light">crm</span></span>
      </a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            className={`nav-link ${activePage === item.id || (activePage === "customer" && item.id === "customers") ? "is-active" : ""}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-mark">{item.mark}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <button className={`nav-link settings-link ${activePage === "settings" ? "is-active" : ""}`} onClick={() => onNavigate("settings")}>
        <span className="nav-mark">SE</span>
        <span>Settings</span>
      </button>
      <button className={`nav-link contact-link ${activePage === "contact" ? "is-active" : ""}`} onClick={() => onNavigate("contact")}>
        <span className="nav-mark">+</span>
        <span>Contact form</span>
      </button>
      <div className="sidebar-profile">
        <span className="profile-avatar">CS</span>
        <span><strong>Connect Sales</strong><small>Team workspace</small></span>
        <span className="profile-menu">···</span>
      </div>
    </aside>
  );
}