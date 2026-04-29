// Anonymous device identifier persisted in localStorage so Plaid-linked accounts
// can be associated with a browser without requiring sign-in.
const KEY = "wealthwise_device_id";

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Fallback for environments without localStorage
    return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
