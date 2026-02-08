import { createContext, useContext, useReducer } from "react";
import { gameReducer, initialState } from "./gameReducer";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
