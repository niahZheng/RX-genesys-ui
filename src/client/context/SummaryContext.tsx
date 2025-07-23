import React, { createContext, useContext, useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';

interface SummaryContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  errorCards: Array<{id: string, message: string}>;
  setErrorCards: React.Dispatch<React.SetStateAction<Array<{id: string, message: string}>>>;
  timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  timeoutError: boolean;
  setTimeoutError: (error: boolean) => void;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

export const SummaryProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [errorCards, setErrorCards] = useState<Array<{id: string, message: string}>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);

  return (
    <SummaryContext.Provider value={{
      loading,
      setLoading,
      errorCards,
      setErrorCards,
      timeoutRef,
      timeoutError,
      setTimeoutError
    }}>
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummary = () => {
  const context = useContext(SummaryContext);
  if (context === undefined) {
    throw new Error('useSummary must be used within a SummaryProvider');
  }
  return context;
};
