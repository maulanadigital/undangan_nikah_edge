async function request(path, options = {}) {
  const response = await fetch(`/api/admin${path}`, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const adminApi = {
  setupStatus: () => request("/auth/setup-status"),
  setup: (body) => request("/auth/setup", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  changePassword: (body) => request("/auth/password", { method: "POST", body }),
  invitations: () => request("/invitations"),
  invitationRequests: () => request("/requests"),
  requestStats: () => request("/requests/stats"),
  updateRequestStatus: (id, status) =>
    request(`/requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { status },
    }),
  invitation: (uid) => request(`/invitations/${encodeURIComponent(uid)}`),
  createInvitation: (body) => request("/invitations", { method: "POST", body }),
  updateInvitation: (uid, body) =>
    request(`/invitations/${encodeURIComponent(uid)}`, {
      method: "PUT",
      body,
    }),
  deleteInvitation: (uid) =>
    request(`/invitations/${encodeURIComponent(uid)}`, { method: "DELETE" }),
  createAgenda: (uid, body) =>
    request(`/invitations/${encodeURIComponent(uid)}/agenda`, {
      method: "POST",
      body,
    }),
  updateAgenda: (uid, id, body) =>
    request(`/invitations/${encodeURIComponent(uid)}/agenda/${id}`, {
      method: "PUT",
      body,
    }),
  deleteAgenda: (uid, id) =>
    request(`/invitations/${encodeURIComponent(uid)}/agenda/${id}`, {
      method: "DELETE",
    }),
  createBank: (uid, body) =>
    request(`/invitations/${encodeURIComponent(uid)}/banks`, {
      method: "POST",
      body,
    }),
  updateBank: (uid, id, body) =>
    request(`/invitations/${encodeURIComponent(uid)}/banks/${id}`, {
      method: "PUT",
      body,
    }),
  deleteBank: (uid, id) =>
    request(`/invitations/${encodeURIComponent(uid)}/banks/${id}`, {
      method: "DELETE",
    }),
  stats: (uid) => request(`/invitations/${encodeURIComponent(uid)}/stats`),
  wishes: (uid, offset = 0) =>
    request(
      `/invitations/${encodeURIComponent(uid)}/wishes?limit=50&offset=${offset}`,
    ),
  deleteWish: (uid, id) =>
    request(`/invitations/${encodeURIComponent(uid)}/wishes/${id}`, {
      method: "DELETE",
    }),
  guests: (uid) =>
    request(`/invitations/${encodeURIComponent(uid)}/guests`),
  importGuests: (uid, guests) =>
    request(`/invitations/${encodeURIComponent(uid)}/guests/import`, {
      method: "POST",
      body: { guests },
    }),
  deleteGuest: (uid, id) =>
    request(
      `/invitations/${encodeURIComponent(uid)}/guests/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    ),
};
