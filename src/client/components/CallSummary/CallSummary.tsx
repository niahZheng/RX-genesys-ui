import * as styles from "./CallSummary.module.scss";
import * as widgetStyles from "@client/widget.module.scss";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {SocketPayload, useSocketEvent} from "@client/providers/Socket";
import { useSummary } from "@client/context/SummaryContext";
import { InlineLoading, InlineNotification } from "@carbon/react";
import { useAccordion } from "@client/context/AccordionContext";
import { Copy, MisuseOutline, Warning } from "@carbon/icons-react";
import { useSocket } from "@client/providers/Socket";
import { array } from "fp-ts";
import { v4 as uuid } from "uuid";

const CallSummary = () => {
  const [summary, setSummary] = useState<any>("");
  const [intent, setIntent] = useState<any>("");
  const [request_changes, setRequestchanges] = useState<any>("");
  const [ata, setAta] = useState<any[]>([]);
  const [startTime,setStartTime] = useState<string>("");
  const [endTime,setEndTime] = useState<string>("");
  const {t} = useTranslation();
  const {lastMessage} = useSocketEvent('celeryMessage');
  const { expandedSection, setExpandedSection } = useAccordion();
  const conversationid = new URLSearchParams(window.location.search).get('conversationid') || 'undefined';
  const [copied, setCopied] = useState(false);
  const { loading, setLoading, errorCards, setErrorCards, timeoutRef, timeoutError, setTimeoutError } = useSummary();
  const {socket} = useSocket();

  const handleCopy = () => {
    // 复制summary section中除按钮外的所有内容
    let textToCopy = '';
    if (startTime) textToCopy += `Start: ${formattedStartTime}\n`;
    if (endTime) textToCopy += `End: ${formattedEndTime}\n`;
    if (startTime && endTime) textToCopy += `Duration: ${duration}\n`;
    if (summary?.intent) textToCopy += `Initial Request: ${summary?.intent}`;
    if (endTime) textToCopy += `Requested Changes: ${summary?.request_changes}\n`;
    if (endTime) textToCopy += `Actions Taken by Agent: ${ata.toString()}\n`;
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  
  const requestSummary = (conversationId: any) => {
    setLoading(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setErrorCards(prev => [
        ...prev,
        { id: uuid(), message: "Summary request timeout. Please try again or contact support." }
      ]);
    }, 300000); // 5分钟
    
    const payload = {
      destination: `agent-assist/${conversationId}/ui`,
      text: "callSummary",
    }
    socket.emit("callSummary", JSON.stringify(payload));
    // socket.emit("webUiMessage", JSON.stringify(payload));
    console.log("callSummary socket emit successfully")
  }

  useEffect(() => {
    if (lastMessage) {
      const payload: SocketPayload = JSON.parse(lastMessage?.payloadString);
      if (payload?.type === "summary" && payload?.parameters?.text) {
        setSummary(payload?.parameters?.text || "");
        // setIntent(payload?.parameters?.text?.intent || "");
        // setRequestchanges(payload?.parameters?.text?.request_changes || "");
        setAta(payload?.parameters?.text?.ata || []);
        setStartTime(payload?.parameters?.conversationStartTime || "");
        setEndTime(payload?.conversationEndTime || "");
        setLoading(false);
        setTimeoutError(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    }
    // eslint-disable-next-line
  }, [lastMessage])

  const formatDateTime = (dateTimeString: string | number | Date) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formattedStartTime = formatDateTime(startTime);
  const formattedEndTime = formatDateTime(endTime);

  const calculateDuration = (startTime:any, endTime:any) => {
    const start:any = new Date(startTime);
    const end:any = new Date(endTime);
    
    // 计算时间差（毫秒）
    const diffInMs = end - start;
    
    // 转换为小时、分钟、秒
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
    
    // 格式化输出
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const duration = calculateDuration(startTime, endTime);

  // 处理 summary 字符串中的转义字符
  const parseSummary = (raw: string) => {
    if (!raw) return "";
    try {
      // // 先将所有 \\u 替换为 \u，防止双转义
      // const fixed = raw.replace(/\\u/g, '\u');
      // 用 JSON.parse 解析所有转义字符（包括 \n、\uXXXX）
      const parsed = JSON.parse('"' + raw.replace(/"/g, '\\"') + '"');
      // 再将 \n 替换为 <br />
      return parsed.split('\n').map((line: string, idx: number, arr: string[]) => (
        <span key={idx}>
          {line}
          {idx !== arr.length - 1 && <br />}
        </span>
      ));
    } catch (e) {
      // 解析失败则原样输出
      return raw;
    }
  };

  return (
    <div
      className={`flex flex-col items-start shrink-0 rounded-xl bg-white mt-[20px] self-stretch gap-2.5 border border-solid border-gray-100 ${
        expandedSection === "callSummary" ? "h-[690px]" : "h-[63px]"
      }`}
      style={{ position: 'relative' }}
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
      {/* 异常区：所有异常卡片紧密排列在顶部 */}
      {errorCards.length > 0 && (
        <div className="p-4 bg-Surface-Card inline-flex flex-col justify-center items-end gap-2">
          <div className="flex flex-col w-full gap-2.5">
            {errorCards.map(card => (
              <div
                key={card.id}
                className="self-stretch min-w-48 px-4 py-2 bg-pink-50 outline outline-b-2 outline-red-400 inline-flex justify-center items-start gap-4"
              >
                <div className="flex-1 py-0.5 flex justify-center items-start gap-2.5">
                  <div className="w-6 py-0.5 flex justify-start items-center gap-2.5">
                    <div className="flex-1 inline-flex flex-col justify-center items-center gap-2.5">
                    <Warning style={{color:'#E97075'}}/>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-start items-start gap-2">
                    <div className="flex-1 justify-start text-black text-xs font-normal leading-none">
                      {card.message}
                    </div>
                  </div>
                </div>
                <div className="py-2 flex justify-start items-center gap-2.5">
                  <div className="w-4 flex justify-start items-center gap-3">
                    <div
                      className="w-4 h-4 relative overflow-hidden cursor-pointer"
                      onClick={() => setErrorCards(prev => prev.filter(c => c.id !== card.id))}
                    >
                      <MisuseOutline style={{color:'#E97075'}}/>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
            <div className="flex justify-center items-center w-full py-4 border-b border-gray-100 bg-white">
              <button 
                className="w-[214px] px-6 py-2 rounded-3xl justify-center items-center gap-4 border bg-white text-xs hover:bg-gray-50 transition-colors"
                onClick={() => requestSummary(conversationid)}
                disabled={loading}
              >
                {loading ? t("loadingSummary") : "Generate Summary"}
              </button>
            </div>
            {/* {timeoutError && (
              <div className="w-full flex justify-center p-2">
                <InlineNotification
                  kind="error"
                  title="Timeout"
                  subtitle="Generate summary timeout."
                  onCloseButtonClick={() => setTimeoutError(false)}
                />
              </div>
            )} */}
            <div className="self-stretch p-5 inline-flex flex-col justify-start items-start gap-2.5">
              <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
              <div className="py-px inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center"><span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Start: </span><span className="text-Labels-Primary text-sm leading-snug">{startTime ? formattedStartTime : ""}</span></div>
              </div>
              <div className="inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center"><span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">End: </span><span className="text-Labels-Primary text-sm leading-snug">{endTime ? formattedEndTime : ""}</span></div>
              </div>
              <div className="inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center"><span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Duration: </span><span className="text-Labels-Primary text-sm leading-snug">{startTime && endTime ? duration : ""}</span></div>
              </div>
              <div className="inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center">
                  <span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Initial Request: </span>
                  {/* <span className="text-Labels-Primary text-sm leading-snug">{summary?.intent ? summary?.intent : ""}</span> */}
                  <div className="w-52 p-[5px] inline-flex justify-center items-center">
                    <div className="flex-1 opacity-90 justify-center text-Labels-Primary text-sm font-normal font-['Loew_Riyadh_Air'] leading-snug">{summary?.intent ? summary?.intent : ""}</div>
                  </div>
                </div>
              </div>
              <div className="inline-flex justify-center items-center gap-2.5">
                <div className="opacity-90 justify-center">
                  <span className="text-Labels-Primary text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Requested Changes: </span>
                  {/* <span className="text-Labels-Primary text-sm leading-snug">{summary?.request_changes ? summary?.request_changes : ""}</span> */}
                  <div className="w-52 p-[5px] inline-flex justify-center items-center">
                    <div className="flex-1 opacity-90 justify-center text-Labels-Primary text-sm font-normal font-['Loew_Riyadh_Air'] leading-snug">{summary?.request_changes ? summary?.request_changes : ""}</div>
                  </div>
                </div>
              </div>
                
              </div>
              {summary && (
                <div style={{
                  position: 'absolute',
                  right: 24,
                  bottom: 24,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  {copied && (
                    <div className="p-2 bg-[#E6E5FF] rounded-lg inline-flex justify-start items-start gap-1">
                    <div className="max-h-16 text-center justify-end text-xs font-normal leading-none">Summary Copied!</div>
                    </div>
                    
                  )}
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    title="Copy to clipboard"
                  >
                    <Copy size={20} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallSummary;