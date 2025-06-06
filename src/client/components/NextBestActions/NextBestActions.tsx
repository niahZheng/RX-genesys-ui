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
    // <div className={widgetStyles.dashboardWidget}>
    <div className=" flex flex-col items-start shrink-0 rounded-xl bg-white mt-[33px] self-stretch border border-solid border-gray-100">
      <div className={styles.actionTileContainer}></div>
      <Accordion>
        <AccordionItem 
          title="Quick Action" 
          open={expandedSection === 'nextBestAction'}
          onClick={(e) => {
            if (e.target instanceof HTMLElement && e.target.closest('.cds--accordion__title')) {
              setExpandedSection('nextBestAction')
            }
          }}
        >
          <div 
            ref={scrollRef}
            className="overflow-y-auto max-h-[690px] scrollbar-hide"
            style={{
              scrollbarWidth: 'none',  /* Firefox */
              msOverflowStyle: 'none',  /* IE and Edge */
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {actions.length ? actions.map((action, id) =>
                <BestAction key={id} action={action} updateAction={updateAction} sendManualCompletion={sendManualCompletion}></BestAction>) :
              <InlineLoading description={t("loadingAction")}/>}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NextBestActions;