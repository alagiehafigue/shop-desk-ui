const ACCESS_TOKEN_KEY = "shopdesk.accessToken";
const USER_KEY = "shopdesk.user";

export function getStoredAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token) {
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getStoredUser() {
  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) {
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage() {
  setStoredAccessToken(null);
  setStoredUser(null);
}
