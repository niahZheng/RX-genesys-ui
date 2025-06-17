import * as styles from "./NextBestActions.module.scss";
import * as widgetStyles from "@client/widget.module.scss";
import {useTranslation} from "react-i18next";
import {useEffect, useState, useRef} from "react";
import {SocketPayload, useSocketEvent, useSocket} from "@client/providers/Socket";
import BestAction from "./BestAction";
import * as _ from "lodash";
import {Accordion, AccordionItem, InlineLoading} from "@carbon/react";
import { useAccordion } from "@client/context/AccordionContext";

export enum ActionState {
  active = "active",
  stale = "stale",
  expired = "expired",
  complete = "complete"
}

export type Action = {
  text: string;
  actionId: number;
  state: ActionState;
  createdAt: number
}

const NextBestActions = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const {t} = useTranslation();
  const {lastMessage} = useSocketEvent('celeryMessage');
  const {socket} = useSocket();
  const [sessionId, setSessionId] = useState<String>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { expandedSection, setExpandedSection } = useAccordion();

  useEffect(() => {
    if (lastMessage) {
      const payload: SocketPayload = JSON.parse(lastMessage?.payloadString);
      console.log(payload)

      const action: Action = {
        text: payload?.parameters?.text || "",
        actionId: payload?.parameters?.action_id || 0,
        state: ActionState.active,
        createdAt: new Date().getTime()
      };

      if (payload?.type === "new_action") {
        setActions(prevState => [...prevState, action]);
      } else if (payload?.type === "session_started") {
        // trying to grab the session ID when receiving the session open message
        // we need this along with the agent id when sending an manual action on click message back to socketio
        setSessionId(payload.parameters.session_id)
      } else if (payload?.type === "completed_action") {
        action.state = ActionState.complete;
        updateAction(action);
        // const payload = {
        //   destination: `agent-assist/${session_id}/ui`,
        //   text: "Next step"
        // }
        // socket.emit("webUiMessage", JSON.stringify(payload))
      }
    }
  }, [lastMessage])

  const updateAction = (action: Action) => {
    setActions(prevState => {
      const actionToUpdate: Action | undefined = _.find(prevState, value => value.actionId === action?.actionId);

      if (actionToUpdate) {
        actionToUpdate.state = action.state;
        actionToUpdate.text = action.text;
      }

      return prevState;
    });
  };

  // this emits a message back to api-server, which then creates a celery task
  const sendManualCompletion = () => {
    const payload = {
      destination: `agent-assist/${sessionId}/ui`,
      text: "Next step"
    }
    console.log(payload)
    socket.emit("webUiMessage", JSON.stringify(payload))
  }

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions]);

  return (
    <div className={`flex flex-col items-start shrink-0 rounded-xl bg-white mt-[33px] self-stretch border border-solid border-gray-100 ${expandedSection === 'nextBestAction' ? 'h-[690px]' : 'h-[63px]'}`}>
      <div className={styles.actionTileContainer}></div>
      <div className="w-full rounded-xl overflow-hidden flex flex-col h-full">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 h-[63px] bg-[#F6F6F6]"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const arrow = target.closest('.accordion-arrow');
            if (arrow) {
              setExpandedSection(expandedSection === 'nextBestAction' ? 'callSummary' : 'nextBestAction');
            }
          }}
        >
          {/* <h3 className="text-base font-medium">Quick Action</h3> */}
          <div className="self-stretch opacity-90 justify-center text-Labels-Primary text-xl font-bold  leading-loose">Quick Actions</div>
          <div 
            className={`accordion-arrow transform transition-transform duration-200 ${expandedSection === 'nextBestAction' ? 'rotate-180' : ''}`}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.94 5.72668L8 8.78002L11.06 5.72668L12 6.66668L8 10.6667L4 6.66668L4.94 5.72668Z" fill="#000000"/>
            </svg>
          </div>
        </div>
        {expandedSection === 'nextBestAction' && (
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              {actions.length > 0 && (
                <div 
                  ref={scrollRef}
                  className="overflow-y-auto scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {actions.map((action, id) =>
                    <BestAction key={id} action={action} updateAction={updateAction} sendManualCompletion={sendManualCompletion}></BestAction>
                  )}
                </div>
              )}
              {actions.length === 0 && <InlineLoading description={t("loadingAction")}/>}
            </div>
            <div className="flex justify-center items-center w-full py-4 border-t border-gray-100 bg-white">
              <button 
                className="w-[214px] px-6 py-2 rounded-3xl justify-center items-center gap-4 border bg-white text-xs hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedSection('callSummary')}
              >
                Generate Summary
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NextBestActions;