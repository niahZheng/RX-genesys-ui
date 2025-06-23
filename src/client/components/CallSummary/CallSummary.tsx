import * as styles from "./CallSummary.module.scss";
import * as widgetStyles from "@client/widget.module.scss";
import {useTranslation} from "react-i18next";
import {useEffect, useState, useRef} from "react";
import {SocketPayload, useSocketEvent} from "@client/providers/Socket";
import { InlineLoading, InlineNotification } from "@carbon/react";
import { useAccordion } from "@client/context/AccordionContext";
import { Copy } from "@carbon/icons-react";
import { useSocket } from "@client/providers/Socket";

const CallSummary = () => {
  const [summary, setSummary] = useState<string>("");
  const {t} = useTranslation();
  const {lastMessage} = useSocketEvent('celeryMessage');
  const { expandedSection, setExpandedSection } = useAccordion();
  const conversationid = new URLSearchParams(window.location.search).get('conversationid') || 'undefined';
  const [loading, setLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    // const textToCopy = `Start: ${startTime}\nEnd: ${endTime}\nDuration: ${duration}\n\n${summary}`;
    const textToCopy = `${summary}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  
  const {socket} = useSocket();
  const requestSummary = (conversationId: any) => {
    setLoading(true);
    setTimeoutError(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setTimeoutError(true);
    }, 300000); // 5分钟
    const payload = {
      destination: `agent-assist/${conversationId}/ui`,
      text: "callSummary",
    }
    socket.emit("callSummary", JSON.stringify(payload))
    console.log("callSummary socket emit sucessfully")
  }

  useEffect(() => {
    if (lastMessage) {
      const payload: SocketPayload = JSON.parse(lastMessage?.payloadString);
      if (payload?.type === "summary" && payload?.parameters?.text) {
        setSummary(payload?.parameters?.text?.trim() || "");
        setLoading(false);
        setTimeoutError(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    }
    // eslint-disable-next-line
  }, [lastMessage])

  return (
    // <div className={widgetStyles.dashboardWidget}>
    <div
      className={`flex flex-col items-start shrink-0 rounded-xl bg-white mt-[20px] self-stretch gap-2.5 border border-solid border-gray-100 ${
        expandedSection === "callSummary" ? "h-[690px]" : "h-[63px]"
      }`}
    >
      <div className="w-full rounded-xl overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 h-[63px] bg-[#F6F6F6]"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const arrow = target.closest(".accordion-arrow");
            if (arrow) {
              setExpandedSection(
                expandedSection === "callSummary"
                  ? "nextBestAction"
                  : "callSummary"
              );
            }
          }}
        >
          {/* <h3 className="text-base font-medium">Call Summary</h3> */}
          <div className="self-stretch opacity-90 justify-center text-Labels-Primary text-xl font-bold  leading-loose">
            Summary
          </div>
          <div
            className={`accordion-arrow transform transition-transform duration-200 ${
              expandedSection === "callSummary" ? "rotate-180" : ""
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.94 5.72668L8 8.78002L11.06 5.72668L12 6.66668L8 10.6667L4 6.66668L4.94 5.72668Z"
                fill="#000000"
              />
            </svg>
          </div>
        </div>
        {expandedSection === "callSummary" && (
          <div className="overflow-y-auto overflow-x-hidden h-[calc(100%-63px)]" style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <div className="flex justify-center items-center w-full py-4 border-b border-gray-100 bg-white">
              <button 
                className="w-[214px] px-6 py-2 rounded-3xl justify-center items-center gap-4 border bg-white text-xs hover:bg-gray-50 transition-colors"
                onClick={() => requestSummary(conversationid)}
                disabled={loading}
              >
                {loading ? t("loadingSummary") : "Generate Summary"}
              </button>
            </div>
            {timeoutError && (
              <div className="w-full flex justify-center p-2">
                <InlineNotification
                  kind="error"
                  title="请求超时"
                  subtitle="生成摘要超时，请重试。"
                  onCloseButtonClick={() => setTimeoutError(false)}
                />
              </div>
            )}
            <div className="self-stretch p-5 inline-flex flex-col justify-start items-start gap-2.5">
              <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
              <div className="py-px inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center"><span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Start: </span><span className="text-Labels-Primary text-sm font-normal font-['Loew_Riyadh_Air'] leading-snug"></span></div>
              </div>
              <div className="inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center"><span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">End: </span><span className="text-Labels-Primary text-sm font-normal font-['Loew_Riyadh_Air'] leading-snug"></span></div>
              </div>
              <div className="inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center"><span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Duration: </span><span className="text-Labels-Primary text-sm font-normal font-['Loew_Riyadh_Air'] leading-snug"></span></div>
              </div>
                <div className="flex flex-col justify-start items-start w-full">
                  <div className="w-full p-[5px]">
                    <div className="opacity-90 justify-center text-Labels-Primary text-sm font-normal font-['Loew_Riyadh_Air'] leading-snug">
                      {summary ? (summary) : (loading ? <InlineLoading description={t("loadingSummary")} /> : null)}
                    </div>
                  </div>
                  {summary && (
                    <div className="w-full flex justify-end p-2">
                      <button 
                        onClick={handleCopy}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy size={20} className="text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallSummary;