// Prototype only: credentials are checked in the browser. A real build must verify against a backend.
export const ADMIN_USER = 'admin';
export const ADMIN_PASS = 'blush2026';
const AUTH_KEY = 'blushBloomsAdminAuth';
const NAME_KEY = 'blushBloomsAdminName';

export const isAdminAuthed = () => sessionStorage.getItem(AUTH_KEY) === 'true';
export const adminName = () => sessionStorage.getItem(NAME_KEY) || 'admin';
export const adminLogin = name => { sessionStorage.setItem(AUTH_KEY, 'true'); sessionStorage.setItem(NAME_KEY, name); };
export const adminLogout = () => { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(NAME_KEY); };
