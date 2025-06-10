import * as styles from "./CallSummary.module.scss";
import * as widgetStyles from "@client/widget.module.scss";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {SocketPayload, useSocketEvent} from "@client/providers/Socket";
import { InlineLoading} from "@carbon/react";
import { useAccordion } from "@client/context/AccordionContext";

const CallSummary = () => {
  const [summary, setSummary] = useState<string>("");
  const {t} = useTranslation();
  const {lastMessage} = useSocketEvent('celeryMessage');
  const { expandedSection, setExpandedSection } = useAccordion();
  const conversationid = new URLSearchParams(window.location.search).get('conversationid') || 'undefined';

  useEffect(() => {
    if (lastMessage) {
      const payload: SocketPayload = JSON.parse(lastMessage?.payloadString);

      if (payload?.type === "summary" && payload?.parameters?.text) {
        setSummary(payload?.parameters?.text?.trim() || "");
      }
    }
  }, [lastMessage])

  return (
    // <div className={widgetStyles.dashboardWidget}>
    <div className={`flex flex-col items-start shrink-0 rounded-xl bg-white mt-[20px] self-stretch gap-2.5 border border-solid border-gray-100 ${expandedSection === 'callSummary' ? 'h-[690px]' : 'h-[63px]'}`}>
      <div className="w-full rounded-xl overflow-hidden">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 h-[63px] bg-[#F6F6F6]"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const arrow = target.closest('.accordion-arrow');
            if (arrow) {
              setExpandedSection(expandedSection === 'callSummary' ? 'nextBestAction' : 'callSummary');
            }
          }}
        >
          <h3 className="text-base font-medium">Call Summary</h3>
          <div 
            className={`accordion-arrow transform transition-transform duration-200 ${expandedSection === 'callSummary' ? 'rotate-180' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 11L3 6H13L8 11Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        {expandedSection === 'callSummary' && (
          <>
            <div className={styles.summaryText}>
              <pre>
                {summary ? summary : <InlineLoading description={t("loadingSummary")}/>}
              </pre>
            </div>
            <div className="px-4 py-2 text-sm text-gray-600">
                conversation Id: {conversationid}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CallSummary;