import React, { createContext, useContext, useState } from 'react';

interface AccordionContextType {
  expandedSection: string;
  setExpandedSection: (section: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export const AccordionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandedSection, setExpandedSection] = useState<string>('nextBestAction');

  const handleSetExpandedSection = (section: string) => {
    // 如果点击当前展开的部分，则切换到另一个部分
    if (section === expandedSection) {
      setExpandedSection(section === 'nextBestAction' ? 'callSummary' : 'nextBestAction');
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <AccordionContext.Provider value={{ expandedSection, setExpandedSection: handleSetExpandedSection }}>
      {children}
    </AccordionContext.Provider>
  );
};

export const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (context === undefined) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
}; 