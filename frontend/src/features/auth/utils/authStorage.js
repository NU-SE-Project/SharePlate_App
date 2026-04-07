const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const RESTAURANT_ID_KEY = "restaurantId";

const listeners = new Set();

function emitChange(auth) {
  listeners.forEach((listener) => listener(auth));
}

function parseStoredUser() {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
}

export function getStoredAuth() {
  try {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      user: parseStoredUser(),
    };
  } catch (error) {
    return {
      accessToken: null,
      user: null,
    };
  }
}

export function setStoredAuth({ accessToken, user }) {
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      const userId = user.id || user._id;
      if (user.role === "restaurant" && userId) {
        localStorage.setItem(RESTAURANT_ID_KEY, userId);
      } else {
        localStorage.removeItem(RESTAURANT_ID_KEY);
      }
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(RESTAURANT_ID_KEY);
    }
  } catch (error) {
    // Ignore storage write failures and still update subscribers.
  }

  emitChange({
    accessToken: accessToken || null,
    user: user || null,
  });
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(RESTAURANT_ID_KEY);
  } catch (error) {
    // Ignore storage write failures and still update subscribers.
  }

  emitChange({
    accessToken: null,
    user: null,
  });
}

export function subscribeToAuthStorage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const authStorageKeys = {
  accessToken: ACCESS_TOKEN_KEY,
  user: USER_KEY,
  restaurantId: RESTAURANT_ID_KEY,
};
