import {useContext, useEffect, useRef, useState} from "react";
import * as widgetStyles from "@client/widget.module.scss";
import { useTranslation } from "react-i18next";
import {SocketPayload, useSocketEvent} from "@client/providers/Socket";
import Message from "@client/components/Conversation/Message/Message";
import { InlineLoading } from "@carbon/react";
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
    <div className={`flex flex-col justify-start items-start shrink-0 rounded-xl bg-white mt-[33px] self-stretch gap-2.5 border border-solid border-gray-100 ${isOpen ? 'h-[778px]' : 'h-[63px]'}`}>
      <div className="w-full rounded-xl overflow-hidden">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 h-[63px] bg-[#F6F6F6]"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const arrow = target.closest('.accordion-arrow');
            if (arrow) {
              setIsOpen(!isOpen);
            }
          }}
        >
          {/* <h3 className="self-stretch opacity-90 justify-center text-Labels-Primary text-xl font-bold font-['Loew_Riyadh_Air'] leading-loose">Conversation</h3> */}
          <div className="self-stretch opacity-90 justify-center text-Labels-Primary text-xl font-bold  leading-loose">Conversation</div>
          <div 
            className={`accordion-arrow transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.94 5.72668L8 8.78002L11.06 5.72668L12 6.66668L8 10.6667L4 6.66668L4.94 5.72668Z" fill="#000000"/>
            </svg>
          </div>
        </div>
        {isOpen && (
          <div
            ref={scrollRef}
            className="overflow-y-auto scrollbar-hide h-[715px] self-stretch px-5 py-7 flex-col justify-start items-start gap-2.5"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {conversation.map((message, index) => (
              <Message 
                key={`${message.session_id}-${index}`} 
                data={message}
                prevMessage={index > 0 ? conversation[index - 1] : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;
