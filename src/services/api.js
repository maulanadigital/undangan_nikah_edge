const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Fetch all wishes for an invitation
 * @param {string} uid - Invitation UID
 * @param {object} options - Query options (limit, offset)
 * @returns {Promise<object>} Response with wishes data
 */
export async function fetchWishes(uid, options = {}) {
  const { limit = 50, offset = 0 } = options;
  const url = new URL(`${API_URL}/api/${uid}/wishes`, window.location.origin);
  url.searchParams.set("limit", limit);
  url.searchParams.set("offset", offset);

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch wishes");
  }
  return response.json();
}

/**
 * Create a new wish
 * @param {string} uid - Invitation UID
 * @param {object} wishData - Wish data (name, message, attendance)
 * @returns {Promise<object>} Response with created wish
 */
export async function createWish(uid, wishData) {
  const response = await fetch(`${API_URL}/api/${uid}/wishes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wishData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Preserve error code for duplicate wish detection
    const error = new Error(data.error || "Failed to create wish");
    error.code = data.code;
    throw error;
  }
  return data;
}

/**
 * Check if guest has already submitted a wish
 * @param {string} uid - Invitation UID
 * @param {string} name - Guest name
 * @returns {Promise<object>} Response with hasSubmitted boolean
 */
export async function checkWishSubmitted(uid, value, isGuestId = false) {
  const endpoint = isGuestId
    ? `${API_URL}/api/${uid}/wishes/check-guest/${encodeURIComponent(value)}`
    : `${API_URL}/api/${uid}/wishes/check/${encodeURIComponent(value)}`;
  const response = await fetch(
    endpoint,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to check wish status");
  }
  return response.json();
}

/**
 * Get attendance statistics
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with stats data
 */
export async function fetchAttendanceStats(uid) {
  const response = await fetch(`${API_URL}/api/${uid}/stats`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch stats");
  }
  return response.json();
}

/**
 * Get invitation details
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with invitation data
 */
export async function fetchInvitation(uid) {
  const response = await fetch(`${API_URL}/api/invitation/${uid}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invitation");
  }
  return response.json();
}

export async function fetchInvitationGuest(uid, slug) {
  const response = await fetch(
    `${API_URL}/api/invitation/${encodeURIComponent(uid)}/guests/${encodeURIComponent(slug)}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch invited guest");
  }
  return data;
}
