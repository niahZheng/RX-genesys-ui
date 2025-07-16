import * as styles from "./BestAction.module.scss";
import { Button, ClickableTile, Tooltip } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";
import { Action, ActionState } from "./NextBestActions";
import { Checkmark, CheckmarkOutline, CloseFilled, Hourglass, MisuseOutline, Result, Warning } from "@carbon/icons-react";
import sanitizeHtml from "sanitize-html";
import { useEffect, useState } from "react";
import { useSocket } from "@client/providers/Socket";


const identificationStatus = true;
const verificationStatus = true;

type ActionOptions = {
  icon: any;
  style: any;
};

const BestAction = ({
  action,
  updateAction,
  sendManualCompletion,
  errorCards,
  setErrorCards,
}: {
  action: Action;
  updateAction: (action: Action) => void;
  sendManualCompletion: () => void;
  errorCards: {id: string, message: string}[];
  setErrorCards: React.Dispatch<React.SetStateAction<{id: string, message: string}[]>>;
}) => {
  const { t } = useTranslation();
  const { socket } = useSocket();

  const [expanded, setExpanded] = useState(false);
  const [confirmingIdentify, setConfirmingIdentify] = useState(false);
  const [loadingUnableIdentify, setLoadingUnableIdentify] = useState(false);
  const [confirmingVerify, setConfirmingVerify] = useState(false);
  const [loadingUnableVerify, setLoadingUnableVerify] = useState(false);
  const [callerIdentified, setCallerIdentified] = useState(false);
  const [unableToIdentify, setUnableToIdentify] = useState(false);
  const [callerVerified, setCallerVerified] = useState(false);
  const [unableToVerify, setUnableToVerify] = useState(false);
  const [hideCallerIdentification, setHideCallerIdentification] = useState(false);
  const [hideCallerVerification, setHideCallerVerification] = useState(false);
  const [statusCards, setStatusCards] = useState<{type: string, id: string}[]>([]);

  const conversationid = new URLSearchParams(window.location.search).get('conversationid') || 'undefined';

  const getIcon = (state: ActionState) => {
    switch (state) {
      case ActionState.active:
        return Result;
      case ActionState.stale:
        return Hourglass;
      case ActionState.expired:
        return CloseFilled;
      case ActionState.complete:
        return Checkmark;
    }
  };

  // const [actionOptions, setActionOptions] = useState<ActionOptions>({
  //   icon: getIcon(action.state),
  //   style: styles[action.state],
  // });

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (action?.state !== ActionState.complete) {
  //       const passedTime = (new Date().getTime() - action.createdAt) / 1000;

  //       if (passedTime > 15 && passedTime < 30) {
  //         action.state = ActionState.stale;
  //       } else if (passedTime >= 30) {
  //         action.state = ActionState.expired;
  //       } else {
  //         action.state = ActionState.active;
  //       }
  //     }

  //     setActionOptions({
  //       icon: getIcon(action.state),
  //       style: styles[action.state],
  //     });

  //     if (
  //       action?.state === ActionState.expired ||
  //       action?.state === ActionState.complete
  //     ) {
  //       clearInterval(interval);
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [action]);

  // const completeAction = () => {
  //   if (action?.state !== ActionState.complete) {
  //     action.state = ActionState.complete;
  //     updateAction(action);
  //     setActionOptions({
  //       icon: getIcon(action.state),
  //       style: styles[action.state],
  //     });
  //     sendManualCompletion();
  //   }
  // };

  const addStatusCard = (type: string) => {
    setStatusCards(prev => [...prev, { type, id: `${type}-${Date.now()}-${Math.random()}` }]);
  };

  const confirmIdentify = (data:any, type: 'identified' ) => {
    if (type === 'identified') setConfirmingIdentify(true);
    //setErrorCards(prev => [...prev, {id: uuid(), message:  "Confirm Identity failed: Unknown error (Error Code 106)"}]);
    const requestdata = {
      conversationid: data,
      buttonType: "identified"
    }
    socket.emit("callIdentification", requestdata, (response:any) => {
      if (type === 'identified') setConfirmingIdentify(false);
      if (response.status === "success") {
        addStatusCard("callerIdentified");
        setHideCallerIdentification(true); // 成功后隐藏 Caller Identification 卡片
      } else {
        setErrorCards(prev => [...prev, {id: uuid(), message: response.message || "Confirm Identity failed: Unknown error (Error Code 106)"}]);
      }
    });
  }


  const unabletoIdentify = (data:any, type: 'failed') => {
    setLoadingUnableIdentify(true);
    const requestdata = {
      conversationid: data,
      buttonType: "failed"
    }
    socket.emit("callIdentification", requestdata, (response:any) => {
      if (type === 'failed') setLoadingUnableIdentify(false);
      if (response.status === "success") {
        addStatusCard("unableToIdentify");
        setHideCallerIdentification(true); // 成功后隐藏 Caller Identification 卡片
      } else {
        setErrorCards(prev => [...prev, {id: uuid(), message: response.message || "Unable to Identify failed: Unknown error (Error Code 106)"}]);
      }
    });
  }

  const confirmVerify = (data:any, type: 'verified' ) => {
    if (type === 'verified') setConfirmingVerify(true);
    //setErrorCards(prev => [...prev, {id: uuid(), message:  "Confirm Identity failed: Unknown error (Error Code 106)"}]);
    const requestdata = {
      conversationid: data,
      buttonType: "verified"
    }
    socket.emit("callValidation", requestdata, (response:any) => {
      if (type === 'verified') setConfirmingVerify(false);
      if (response.status === "success") {
        addStatusCard("callerVerified");
        setHideCallerVerification(true); // 成功后隐藏 Caller Verification 卡片
      } else {
        setErrorCards(prev => [...prev, {id: uuid(), message: response.message || "Confirm Verification failed: Unknown error (Error Code 106)"}]);
      }
    });
  }


  const unabletoVerify = (data:any, type: 'failed') => {
    setLoadingUnableVerify(true);
    const requestdata = {
      conversationid: data,   //data 是conversationid
      buttonType: "failed"
    }
    socket.emit("callValidation", requestdata, (response:any) => {
      setLoadingUnableVerify(false);
      if (response.status === "success") {
        addStatusCard("unableToVerify");
        setHideCallerVerification(true); // 成功后隐藏 Caller Verification 卡片
      } else {
        setErrorCards(prev => [...prev, {id: uuid(), message: response.message || "Unable to Verify failed: Unknown error (Error Code 106)"}]);
      }
    });
  }

  return (
    <div className="flex flex-col justify-start items-center gap-2.5 overflow-hidden">
      {/* 多个异常卡片始终在所有卡片最顶部 */}
      {/* 删除本地 errorCards.map 渲染，异常区交由父组件渲染 */}
      {action.intentType === "Guest Identification" && !hideCallerIdentification && (
      // { !hideCallerIdentification && (
        <div
          className="w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-Border-Border-3 inline-flex flex-col justify-start items-end gap-2 border-[#767692]"
        >
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div className="flex-1 flex justify-center items-center gap-2.5">
              <div className="flex-1 justify-start text-Text-Dark text-sm font-bold leading-snug">
                Caller Identification
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-center items-center gap-2.5">
            <div className="self-stretch justify-start">
              <span className="text-Text-Dark text-xs font-normal">
                Ask for one or more of the following:
                <br />
              </span>
              <ul className="list-disc pl-4 text-Text-Dark text-xs font-normal">
                <li>Full name</li>
                <li>Account number / customer ID</li>
                <li>Registered phone number or email</li>
              </ul>
            </div>
          </div>
          <div>
            <button className={`self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border text-xs mb-2 ${confirmingIdentify ? 'opacity-50 bg-[#EDECEE] text-black' : 'bg-[#240852] text-white'}`}
            onClick={() => confirmIdentify(conversationid, 'identified')}
            disabled={confirmingIdentify || loadingUnableIdentify}
            >
              {confirmingIdentify ? 'Confirming' : 'Confirm Identity'}
            </button>
            <button className={`self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border  text-xs ${loadingUnableIdentify ? 'opacity-50 bg-[#EDECEE]' : 'bg-white'}`}
            onClick={() => unabletoIdentify(conversationid, 'failed')}
            disabled={loadingUnableIdentify || confirmingIdentify}
            >
              {loadingUnableIdentify ? 'Loading' : 'Unable to Identify'}
            </button>
          </div>
        </div>
      )}
      {action.intentType === "Guest Verification" && !hideCallerVerification && (
      // { !hideCallerVerification && (
        <div>
          <div
            className="w-[214px] self-stretch min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-Border-Border-3 inline-flex flex-col justify-start items-end gap-2"
          >
            <div className="self-stretch inline-flex justify-start items-start gap-1">
              <div className="flex-1 flex justify-center items-center gap-2.5">
                <div className="flex-1 justify-start text-Text-Dark text-sm font-bold leading-snug">
                  Caller Verification
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-center items-center gap-2.5">
              <div className="self-stretch justify-start">
                <span className="text-Text-Dark text-xs font-normal">
                  Ask 2 or more security questions,
                  <br />
                  such as
                </span>
                <ul className="list-disc pl-4 text-Text-Dark text-xs font-normal">
                  <li>Last 4 digits of national ID</li>
                  <li>Date of birth</li>
                  <li>Last transaction amount/date</li>
                  <li>Security question</li>
                </ul>
              </div>
            </div>
            <div>
            <button className={`self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border text-xs mb-2 ${confirmingVerify ? 'opacity-50 bg-[#EDECEE] text-black' : 'bg-[#240852] text-white'}`}
            onClick={() => confirmVerify(conversationid, 'verified')}
            disabled={confirmingVerify || loadingUnableVerify}
            >
              {confirmingVerify ? 'Confirming' : 'Confirm Verification'}
            </button>
            <button className={`self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border  text-xs ${loadingUnableVerify ? 'opacity-50 bg-[#EDECEE]' : 'bg-white'}`}
            onClick={() => unabletoVerify(conversationid, 'failed')}
            disabled={loadingUnableVerify || confirmingVerify}
            >
              {loadingUnableVerify ? 'Loading' : 'Unable to Verify'}
            </button>
            </div>
          </div>
        </div>
      )}
      {/* 渲染所有已生成的状态卡片 */}
      {statusCards.map(card => {
        if (card.type === "callerIdentified") {
          return (
          <div>
            <div key={card.id} className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-emerald-300 inline-flex flex-col justify-start items-end gap-2">
              <div className="self-stretch inline-flex justify-start items-start gap-1">
                <div className="flex-1 flex justify-center items-center gap-2.5">
                  <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
                    <CheckmarkOutline style={{ color: '#71CDA2' }} />
                  </div>
                  <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Caller identified</div>
                </div>
              </div>
            </div>
          </div>
          );
        }
        if (card.type === "unableToIdentify") {
          return (
          <div>
            <div key={card.id} className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-red-300 inline-flex flex-col justify-start items-end gap-2">
              <div className="self-stretch inline-flex justify-start items-start gap-1">
                <div className="flex-1 flex justify-center items-center gap-2.5">
                  <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
                    <MisuseOutline style={{color:'#E97075'}}/>
                  </div>
                  <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Unable to Identify</div>
                </div>
              </div>
            </div>
          </div>
          );
        }
        if (card.type === "callerVerified") {
          return (
          <div>
            <div key={card.id} className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-emerald-300 inline-flex flex-col justify-start items-end gap-2">
              <div className="self-stretch inline-flex justify-start items-start gap-1">
                <div className="flex-1 flex justify-center items-center gap-2.5">
                  <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
                    <CheckmarkOutline style={{ color: '#71CDA2' }} />
                  </div>
                  <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Caller Verified</div>
                </div>
              </div>
            </div>
          </div>
          );
        }
        if (card.type === "unableToVerify") {
          return (
          <div>
            <div key={card.id} className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-red-300 inline-flex flex-col justify-start items-end gap-2">
              <div className="self-stretch inline-flex justify-start items-start gap-1">
                <div className="flex-1 flex justify-center items-center gap-2.5">
                  <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
                    <MisuseOutline style={{color:'#E97075'}}/>
                  </div>
                  <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Unable to Verify</div>
                </div>
              </div>
            </div>
          </div>
          );
        }
        return null;
      })}
      {action.intentType !== "Guest Verification" && action.intentType !== "Guest Identification" &&(
      <div>
        <div className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-Border-Border-3 inline-flex flex-col justify-start items-end gap-2">
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div className="flex-1 flex justify-center items-center gap-2.5">
              <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">
                {action.intentType}
              </div>
            </div>
            <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
              <div 
                className={`accordion-arrow transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                onClick={() => setExpanded(!expanded)}
              >
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.94 5.72668L8 8.78002L11.06 5.72668L12 6.66668L8 10.6667L4 6.66668L4.94 5.72668Z" fill="#000000"/>
                </svg>
              </div>
            </div>
          </div>
          {expanded && (
            <div className="self-stretch flex flex-col justify-center items-center gap-2.5">
              <div className="self-stretch justify-start">
                <span className="text-Text-Dark text-xs font-normal font-['Loew_Riyadh_Air'] leading-none">Provide:<br/></span>
                {/* 渲染 quickActions 有序列表 */}
                {Array.isArray(action.quickActions) && action.quickActions.length > 0 && (
                  <ol className="list-decimal pl-4 text-Text-Dark text-xs font-normal">
                    {action.quickActions.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}          
      </div>
    </div>
  )}
    </div>
  );
};

export default BestAction;
