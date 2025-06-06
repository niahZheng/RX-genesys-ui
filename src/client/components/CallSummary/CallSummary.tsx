import * as styles from "./CallSummary.module.scss";
import * as widgetStyles from "@client/widget.module.scss";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {SocketPayload, useSocketEvent} from "@client/providers/Socket";
import {Accordion, AccordionItem, InlineLoading} from "@carbon/react";
import { useAccordion } from "@client/context/AccordionContext";

const CallSummary = () => {
  const [summary, setSummary] = useState<string>("");
  const {t} = useTranslation();
  const {lastMessage} = useSocketEvent('celeryMessage');
  const { expandedSection, setExpandedSection } = useAccordion();
  const agentId = new URLSearchParams(window.location.search).get('conversationid') || 'undefined';

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
    <div className="flex flex-col items-start shrink-0  rounded-xl bg-white mt-[33px] self-stretch gap-2.5 border border-solid border-gray-100">
      <Accordion>
        <AccordionItem 
          title="Call Summary" 
          open={expandedSection === 'callSummary'}
          onClick={(e) => {
            if (e.target instanceof HTMLElement && e.target.closest('.cds--accordion__title')) {
              setExpandedSection('callSummary')
            }
          }}
        >
          <div className={styles.summaryText}>
            <pre>
              {summary ? summary : <InlineLoading description={t("loadingSummary")}/>}
            </pre>
          </div>
          <div className="px-4 py-2 text-sm text-gray-600">
            Agent ID: {agentId}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CallSummary;