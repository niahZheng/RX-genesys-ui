import {useContext, useEffect, useRef, useState} from "react";
import * as widgetStyles from "@client/widget.module.scss";
import { useTranslation } from "react-i18next";
import {SocketPayload, useSocketEvent} from "@client/providers/Socket";
import Message from "@client/components/Conversation/Message/Message";
import { Accordion, AccordionItem, InlineLoading } from "@carbon/react";
import * as styles from "./Conversation.module.scss";

const Conversation = () => {
  const {t} = useTranslation();
  const [conversation, setConversation] = useState<any[]>([]);
  const { lastMessage } = useSocketEvent('celeryMessage');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (lastMessage) {
      const payload: SocketPayload = JSON.parse(lastMessage?.payloadString);
  
      if (payload?.type === "transcription" && payload) {
        setConversation(prev => [...prev, payload?.parameters]);
        console.log("New message received:", payload?.parameters);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="flex flex-col justify-start items-start shrink-0 rounded-xl bg-white mt-[33px] h-[778px]  self-stretch gap-2.5 border border-solid border-gray-100 ">
        <Accordion>
          <AccordionItem 
            title="Conversation" 
            open={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            // className={isOpen ? styles.accordionOpen : styles.accordionTitle}
          >
            <div 
              ref={scrollRef}
              className="overflow-y-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {conversation.map((message, index) => (
                <Message key={`${message.session_id}-${index}`} data={message}/>
              ))}
            </div>
          </AccordionItem>
        </Accordion>
    </div>
  );
};

export default Conversation;
