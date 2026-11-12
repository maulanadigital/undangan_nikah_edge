import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchInvitation, fetchInvitationGuest } from "@/services/api";
import {
  getWeddingUid,
  storeWeddingUid,
  storeGuestName,
} from "@/lib/invitation-storage";
import { safeBase64 } from "@/lib/base64";
import { InvitationContext } from "./invitation-context-definition";

/**
 * InvitationProvider component
 * Provides the invitation UID and config data throughout the app
 *
 * Security Features:
 * - Stores UID in localStorage to hide from URL
 * - Cleans URL after extracting parameters
 * - Prevents Wayback Machine scraping
 * - 30-day expiration for stored data
 * - Automatically updates when different UID or guest name is provided
 *
 * The UID priority:
 * 1. URL parameters (if different from stored, updates localStorage)
 * 2. localStorage (if not expired and no URL override)
 * 3. Environment variable: VITE_INVITATION_UID
 *
 * @example
 * <InvitationProvider>
 *   <App />
 * </InvitationProvider>
 */
export function InvitationProvider({ children }) {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const guestSlug =
    pathSegments[1] === "tamu" ? (pathSegments[2] ?? null) : null;

  const invitationUid = useMemo(() => {
    // Extract UID from URL first (to check if it's different)
    let uidFromUrl = null;

    // 1. Try to get UID from URL path (e.g., /rifqi-dina-2025)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      uidFromUrl = pathSegments[0];
    }

    // 2. Try to get UID from URL query parameter (legacy support)
    if (!uidFromUrl) {
      const urlParams = new URLSearchParams(location.search);
      uidFromUrl = urlParams.get("uid");
    }

    // Check if we have a stored UID
    const storedUid = getWeddingUid();

    // If URL has UID and it's different from stored, update localStorage
    if (uidFromUrl && uidFromUrl !== storedUid) {
      console.log(`Updating invitation from "${storedUid}" to "${uidFromUrl}"`);
      storeWeddingUid(uidFromUrl);
      return uidFromUrl;
    }

    // If URL has UID (same as stored or no stored), use it
    if (uidFromUrl) {
      storeWeddingUid(uidFromUrl);
      return uidFromUrl;
    }

    // If no URL UID but have stored UID, use stored
    if (storedUid) {
      return storedUid;
    }

    // 3. Fallback to environment variable
    const uidFromEnv = import.meta.env.VITE_INVITATION_UID;

    if (uidFromEnv) {
      storeWeddingUid(uidFromEnv);
      return uidFromEnv;
    }

    // If no UID is provided, log a warning
    console.warn(
      "No invitation UID found. Please provide /your-uid in the URL or set VITE_INVITATION_UID in .env",
    );
    return null;
  }, [location.pathname, location.search]);

  const legacyGuestName = useMemo(() => {
    const guestParam = new URLSearchParams(location.search).get("guest");
    if (!guestParam) return null;
    try {
      return safeBase64.decode(guestParam) || null;
    } catch (error) {
      console.error("Error decoding guest name:", error);
      return null;
    }
  }, [location.search]);

  useEffect(() => {
    if (invitationUid) storeWeddingUid(invitationUid);
    if (legacyGuestName) storeGuestName(legacyGuestName);
  }, [invitationUid, legacyGuestName]);

  const {
    data: config,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invitation", invitationUid],
    queryFn: async () => {
      const response = await fetchInvitation(invitationUid);
      if (response.success) {
        return response.data;
      }
      throw new Error("Failed to load invitation");
    },
    enabled: !!invitationUid,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const guestQuery = useQuery({
    queryKey: ["invitation-guest", invitationUid, guestSlug],
    queryFn: async () => {
      const response = await fetchInvitationGuest(invitationUid, guestSlug);
      return response.data;
    },
    enabled: Boolean(invitationUid && guestSlug),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <InvitationContext.Provider
      value={{
        uid: invitationUid,
        config,
        guest: guestQuery.data || (legacyGuestName ? { name: legacyGuestName } : null),
        isLoading,
        guestLoading: guestQuery.isLoading,
        error: error?.message || guestQuery.error?.message,
      }}
    >
      {children}
    </InvitationContext.Provider>
  );
}
