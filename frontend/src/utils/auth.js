export const authUtils = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
  getRole: () => {
    const user = authUtils.getUser();
    return user?.role || null;
  },
  isAdmin: () => authUtils.getRole() === 'admin',
  isVendor: () => authUtils.getRole() === 'vendeur',
  isClient: () => authUtils.getRole() === 'client',
};
