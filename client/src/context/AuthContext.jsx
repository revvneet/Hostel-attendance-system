import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const initialState = {
  token: localStorage.getItem('hms_token') || null,
  user: JSON.parse(localStorage.getItem('hms_user') || 'null'),
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('hms_token', action.token);
      localStorage.setItem('hms_user', JSON.stringify(action.user));
      return { token: action.token, user: action.user };
    case 'LOGOUT':
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      return { token: null, user: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (token, user) => dispatch({ type: 'LOGIN', token, user });
  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
