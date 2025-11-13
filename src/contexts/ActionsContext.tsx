import { createContext, useContext, useState, ReactNode } from 'react';
import { mockActions } from '../data/mockActions';
import type { Action } from '../types';

interface ActionsContextType {
  actions: Action[];
  addAction: (action: Action) => void;
  updateAction: (actionId: string, updates: Partial<Action>) => void;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export function ActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<Action[]>(mockActions);

  const addAction = (action: Action) => {
    setActions((prev) => [...prev, action]);
  };

  const updateAction = (actionId: string, updates: Partial<Action>) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, ...updates } : action
      )
    );
  };

  return (
    <ActionsContext.Provider value={{ actions, addAction, updateAction }}>
      {children}
    </ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error('useActions must be used within an ActionsProvider');
  }
  return context;
}
