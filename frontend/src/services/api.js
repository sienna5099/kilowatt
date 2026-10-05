const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("ConnectCRM could not reach the server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

function jsonBody(value) {
  return JSON.stringify(value);
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getCustomers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    const query = params.size ? `?${params}` : "";
    return request(`/customers${query}`);
  },
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (customer) => request("/customers", { method: "POST", body: jsonBody(customer) }),
  updateCustomerStatus: (id, status) => request(`/customers/${id}/status`, {
    method: "PUT",
    body: jsonBody({ status }),
  }),
  getInteractions: (id) => request(`/customers/${id}/interactions`),
  addInteraction: (id, interaction) => request(`/customers/${id}/interactions`, {
    method: "POST",
    body: jsonBody(interaction),
  }),
  getActivity: () => request("/activity"),
  getFollowups: () => request("/followups"),
  createFollowup: (id, followup) => request(`/customers/${id}/followups`, {
    method: "POST",
    body: jsonBody(followup),
  }),
  updateFollowupStatus: (id, status) => request(`/followups/${id}/status`, {
    method: "PUT",
    body: jsonBody({ status }),
  }),
  getAssistantContext: (id) => request(`/assistant/customers/${id}`),
  checkHealth: () => request("/health"),
};