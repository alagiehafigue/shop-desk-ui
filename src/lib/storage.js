const ACCESS_TOKEN_KEY = "shopdesk.accessToken";
const USER_KEY = "shopdesk.user";
const REMEMBERED_EMAIL_KEY = "shopdesk.rememberedEmail";

function getAuthStorage() {
  return window.sessionStorage;
}

export function getStoredAccessToken() {
  const authStorage = getAuthStorage();
  const token = authStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    return token;
  }

  const legacyToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (legacyToken) {
    authStorage.setItem(ACCESS_TOKEN_KEY, legacyToken);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return legacyToken;
  }

  return null;
}

export function setStoredAccessToken(token) {
  if (!token) {
    getAuthStorage().removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  getAuthStorage().setItem(ACCESS_TOKEN_KEY, token);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  const authStorage = getAuthStorage();
  const rawUser = authStorage.getItem(USER_KEY);

  if (!rawUser) {
    const legacyUser = window.localStorage.getItem(USER_KEY);

    if (!legacyUser) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(legacyUser);
      authStorage.setItem(USER_KEY, JSON.stringify(parsedUser));
      window.localStorage.removeItem(USER_KEY);
      return parsedUser;
    } catch {
      window.localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    authStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) {
    getAuthStorage().removeItem(USER_KEY);
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  getAuthStorage().setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage() {
  setStoredAccessToken(null);
  setStoredUser(null);
}

export function getRememberedEmail() {
  return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
}

export function setRememberedEmail(email) {
  const normalizedEmail = email?.trim() ?? "";

  if (!normalizedEmail) {
    window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    return;
  }

  window.localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
}
