import { createContext, useMemo, useReducer } from "react";
import { initialState } from "./initialState";
import { gameReducer } from "./gameReducer";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      resetGame: () => dispatch({ type: "RESET_GAME" }),
      hydrateState: (nextState) =>
        dispatch({ type: "HYDRATE_STATE", payload: nextState })
    }),
    [state]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
