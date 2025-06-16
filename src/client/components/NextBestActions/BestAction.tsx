import * as styles from "./BestAction.module.scss";
import { Button, ClickableTile, Tooltip } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";
import { Action, ActionState } from "./NextBestActions";
import { Checkmark, CheckmarkOutline, CloseFilled, Hourglass, MisuseOutline, Result } from "@carbon/icons-react";
import sanitizeHtml from "sanitize-html";
import { useEffect, useState } from "react";
import { useSocket } from "@client/providers/Socket";

type ActionOptions = {
  icon: any;
  style: any;
};

const BestAction = ({
  action,
  updateAction,
  sendManualCompletion,
}: {
  action: Action;
  updateAction: (action: Action) => void;
  sendManualCompletion: () => void;
}) => {
  const { t } = useTranslation();
  const { socket } = useSocket();

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

  const [actionOptions, setActionOptions] = useState<ActionOptions>({
    icon: getIcon(action.state),
    style: styles[action.state],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (action?.state !== ActionState.complete) {
        const passedTime = (new Date().getTime() - action.createdAt) / 1000;

        if (passedTime > 15 && passedTime < 30) {
          action.state = ActionState.stale;
        } else if (passedTime >= 30) {
          action.state = ActionState.expired;
        } else {
          action.state = ActionState.active;
        }
      }

      setActionOptions({
        icon: getIcon(action.state),
        style: styles[action.state],
      });

      if (
        action?.state === ActionState.expired ||
        action?.state === ActionState.complete
      ) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [action]);

  const completeAction = () => {
    if (action?.state !== ActionState.complete) {
      action.state = ActionState.complete;
      updateAction(action);
      setActionOptions({
        icon: getIcon(action.state),
        style: styles[action.state],
      });
      sendManualCompletion();
    }
  };

  return (
    // <div className={`${styles.actionTile} ${actionOptions.style}`}>
    //   <Tooltip label={t("clickToComplete")} align="bottom" autoAlign className={styles.tooltip}>
    //     <ClickableTile id={uuid()} renderIcon={actionOptions.icon} onClick={completeAction}>
    //       <div dangerouslySetInnerHTML={{__html: sanitizeHtml(action.text)}}></div>
    //     </ClickableTile>
    //   </Tooltip>
    // </div>
    <div className="flex flex-col justify-start items-center gap-2.5 overflow-hidden">
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
          <button className="self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border bg-[#240852] text-white text-xs">
            Confirm Identity
          </button>
          <button className="self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border bg-white text-xs">
            Unable to Identify
          </button>
        </div>
      </div>
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
            <button className="self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border bg-[#240852] text-white text-xs">
              Confirm Verification
            </button>
            <button className="self-stretch w-full m-w-24 px-6 py-2 rounded-3xl justify-start items-center gap-4 border bg-white text-xs">
              Unable to Verification
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-emerald-300 inline-flex flex-col justify-start items-end gap-2">
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div className="flex-1 flex justify-center items-center gap-2.5">
              <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
                <CheckmarkOutline className="outline-emerald-300"/>
                {/* <div className="w-6 h-6 text-center justify-center text-emerald-300 text-xl font-normal font-['Material_Symbols_Rounded_48pt']">Check_Circle</div> */}
              </div>
              <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Caller identified</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="self-stretch w-[214px] min-w-48 p-4 bg-Surface-Card rounded-xl outline outline-1 outline-offset-[-1px] outline-red-300 inline-flex flex-col justify-start items-end gap-2">
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div className="flex-1 flex justify-center items-center gap-2.5">
              <div className="w-6 h-6 flex justify-end items-center overflow-hidden">
                <MisuseOutline className="outline-red-300"/>
                {/* <div className="w-6 h-6 text-center justify-center text-emerald-300 text-xl font-normal font-['Material_Symbols_Rounded_48pt']">Check_Circle</div> */}
              </div>
              <div className="flex-1 justify-start text-Text-Dark text-sm font-bold font-['Loew_Riyadh_Air'] leading-snug">Caller identified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestAction;
