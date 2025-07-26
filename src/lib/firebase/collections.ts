// Firebase collection references and types
import { getFirebaseAdminDb } from "./admin";
import { getFirebaseDb } from "./client";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  ACTIVITY_LOGS: "activity_logs",
  SESSIONS: "sessions"
} as const;

// Server-side collection references
export const getServerCollections = () => {
  const db = getFirebaseAdminDb();
  if (!db) return null;

  return {
    users: db.collection(COLLECTIONS.USERS),
    activityLogs: db.collection(COLLECTIONS.ACTIVITY_LOGS),
    sessions: db.collection(COLLECTIONS.SESSIONS)
  };
};

// Client-side collection references
export const getClientCollections = () => {
  const db = getFirebaseDb();
  if (!db) return null;

  return {
    users: db.collection(COLLECTIONS.USERS),
    activityLogs: db.collection(COLLECTIONS.ACTIVITY_LOGS),
    sessions: db.collection(COLLECTIONS.SESSIONS)
  };
};
