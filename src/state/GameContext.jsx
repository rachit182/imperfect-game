import { createContext, useReducer } from "react";
import { initialState } from "./initialState";
import { gameReducer } from "./gameReducer";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
