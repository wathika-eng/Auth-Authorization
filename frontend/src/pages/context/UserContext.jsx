import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const nav = useNavigate();

  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const [currentUser, setCurrentUser] = useState(null);

  console.log("====================================");
  console.log(authToken);
  console.log("====================================");

  // Register User
  const register = (name, email, password) => {
    fetch("http://localhost:8080/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.success) {
          alert("Registration successful");
          nav("/login");
        } else if (res.error) {
          alert(res.error);
        } else {
          alert("Something went wrong");
        }
      })
      .catch((error) => {
        console.error("Error during registration:", error);
        alert("Registration failed. Please try again.");
      });
  };

  // Login User
  const login = (email, password) => {
    fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.access_token) {
          setAuthToken(res.access_token);
          localStorage.setItem("token", res.access_token);
          alert("Login successful");
          nav("/dashboard");
        } else if (res.error) {
          alert(res.error);
        } else {
          alert("Something went wrong");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        alert("Login failed. Please try again.");
      });
  };

  // Logout User
  const logout = () => {
    fetch("http://localhost:8080/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Logout failed");
        }
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setAuthToken(null);
          localStorage.removeItem("token");
          alert("Logout successful");
          nav("/login");
        } else {
          alert("Something went wrong");
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        alert("Logout failed. Please try again.");
      });
  };

  useEffect(() => {
    if (authToken) {
      fetch("http://localhost:8080/current_user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          return res.json();
        })
        .then((res) => {
          setCurrentUser(res);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
        });
    } else {
      setCurrentUser(null);
    }
  }, [authToken]);

  const contextData = {
    currentUser,
    register,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={contextData}>{children}</UserContext.Provider>
  );
};
