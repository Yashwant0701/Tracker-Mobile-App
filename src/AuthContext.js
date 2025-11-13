// src/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // selected linked user
  const [allUsers, setAllUsers] = useState([]); // list of linked users
  const [loginResult, setLoginResult] = useState(null); // login API result
  const [isLoading, setIsLoading] = useState(true); // loader for restoring session

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("currentUser");
        const usersStr = await AsyncStorage.getItem("allUsers");
        const loginResultStr = await AsyncStorage.getItem("loginResult");

        if (userStr) setCurrentUser(JSON.parse(userStr));
        if (usersStr) setAllUsers(JSON.parse(usersStr));
        if (loginResultStr) setLoginResult(JSON.parse(loginResultStr));
      } catch (error) {
        //ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Store login API result
  const setLoginApiResult = async (result) => {
    setLoginResult(result);
    await AsyncStorage.setItem("loginResult", JSON.stringify(result));
  };

  // Store current selected user
  const loginUser = async (user) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

  // Switch user from modal
  const switchUser = async (user) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

  // Logout user
  const logoutUser = async () => {
    setCurrentUser(null);
    setAllUsers([]);
    setLoginResult(null);
    await AsyncStorage.multiRemove(["currentUser", "allUsers", "loginResult"]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loginResult,
        isLoading,
        setCurrentUser,
        loginUser,
        switchUser,
        logoutUser,
        setLoginApiResult,
        setAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
