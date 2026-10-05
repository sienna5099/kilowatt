import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Activity from "./pages/Activity";
import Assistant from "./pages/Assistant";
import ContactForm from "./pages/ContactForm";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Dashboard from "./pages/Dashboard";
import Followups from "./pages/Followups";
import Leads from "./pages/Leads";
import Settings from "./pages/Settings";
import "./App.css";

const pageTitles = {
  dashboard: "Overview", customers: "Customers", customer: "Customer profile",
  leads: "Lead pipeline", activity: "Activity", followups: "Follow-ups",
  assistant: "AI assistant", contact: "Contact form", settings: "Settings",
};

function initialPage() {
  if (window.location.pathname === "/contact") return "contact";
  return new URLSearchParams(window.location.search).get("view") || "dashboard";
}

export default function App() {
  const [activePage, setActivePage] = useState(initialPage);
  const [customerId, setCustomerId] = useState(new URLSearchParams(window.location.search).get("customer") || "");
  const isPublicContact = window.location.pathname === "/contact";

  useEffect(() => {
    function syncRoute() {
      setActivePage(initialPage());
      setCustomerId(new URLSearchParams(window.location.search).get("customer") || "");
    }
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function navigate(page) {
    setActivePage(page);
    const params = new URLSearchParams();
    if (page !== "dashboard") params.set("view", page);
    window.history.pushState({}, "", `/${params.size ? `?${params}` : ""}`);
  }

  function openCustomer(id) {
    setCustomerId(String(id));
    setActivePage("customer");
    window.history.pushState({}, "", `/?${new URLSearchParams({ view: "customer", customer: id })}`);
  }

  if (isPublicContact) return <ContactForm publicPage />;

  function renderPage() {
    switch (activePage) {
      case "customers": return <Customers onSelectCustomer={openCustomer} />;
      case "customer": return <CustomerDetail customerId={customerId} onBack={() => navigate("customers")} onNavigate={navigate} />;
      case "leads": return <Leads onSelectCustomer={openCustomer} />;
      case "activity": return <Activity onSelectCustomer={openCustomer} />;
      case "followups": return <Followups onSelectCustomer={openCustomer} />;
      case "assistant": return <Assistant />;
      case "contact": return <ContactForm onBack={() => navigate("dashboard")} />;
      case "settings": return <Settings />;
      default: return <Dashboard onNavigate={navigate} onSelectCustomer={openCustomer} />;
    }
  }

  return <div className="app-shell">
    <Sidebar activePage={activePage} onNavigate={navigate} />
    <div className="main-column">
      <header className="topbar"><div className="breadcrumb"><span>ConnectCRM</span><span>/</span><strong>{pageTitles[activePage] || "Overview"}</strong></div><a className="public-link" href="/contact" target="_blank" rel="noreferrer">Open public form <span>↗</span></a></header>
      <main className="page-content" key={activePage}>{renderPage()}</main>
      <footer className="app-footer"><span>CONNECTCRM</span><span>Customer relationships, thoughtfully connected.</span></footer>
    </div>
  </div>;
}
