import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // We create a simple user object to indicate the user is logged in.
        setUser({ token, id: decodedToken.id });
      } catch (err) {
        console.error("Failed to decode JWT token:", err);
        localStorage.removeItem('userToken');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/users/login`,
        { email, password }
      );
      
      localStorage.setItem('userToken', data.token);
      // The backend returns the user object, so we set the state with the full user data.
      setUser({ ...data, token: data.token });
      return { success: true };
    } catch (error) {
      // Better error handling for login failures
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    return { success: true };
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Add named export
export { UserContext };
export default UserContext;
