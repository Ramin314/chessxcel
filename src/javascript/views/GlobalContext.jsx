import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [globalState, setGlobalState] = useState({
    baseApiUrl: process.env.ClassicalChessCoachBaseApiUrl || 'http://localhost:8080',
  });

  return (
    <GlobalContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}
