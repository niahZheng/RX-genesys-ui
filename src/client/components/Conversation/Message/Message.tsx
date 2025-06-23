import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

interface MessageProps {
  data: any;
  prevMessage?: any;
  nextMessage?: any;
}

const Message = ({ data, prevMessage, nextMessage }: MessageProps) => {
  const [isAgentMessage, setIsAgentMessage] = useState<boolean | null>(null);
  const [showUserLabel, setShowUserLabel] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(false);

  useEffect(() => {
    if (!data) return;
    setIsAgentMessage(data?.source === "internal");
    
    // 判断是否显示用户标识
    if (prevMessage) {
      setShowUserLabel(prevMessage.source !== data.source);
    }
    
    // 判断是否显示时间戳
    // 1. 如果没有下一条消息，说明是最后一条消息，显示时间戳
    // 2. 如果有下一条消息，且下一条消息是不同用户发送的，说明是当前用户的最后一条消息，显示时间戳
    setShowTimestamp(!nextMessage || nextMessage.source !== data.source);
    
    console.log("Message data:", data);
  }, [data, prevMessage, nextMessage]);

  if (isAgentMessage === null) {
    return <></>;
  }

  return (
    <div className="self-stretch flex flex-col justify-start gap-0.5">
      <div className={`flex ${isAgentMessage ? "justify-start" : "justify-end"}`}>
        <div className={`flex flex-col max-w-[100%]`}>
          {showUserLabel && (
            <p
              className={`text-[10px] ${isAgentMessage ? "text-start" : "text-end"} mb-1`}
            >
              {isAgentMessage ? "external" : "you"}
            </p>
          )}
          <div
            className={`p-3 w-full max-w-72 ${
              isAgentMessage
                ? "bg-[#E6E5FF] border-gray-600"
                : "bg-[#E5E5EA] border-black"
            } ${isAgentMessage ? "rounded-tr-2xl rounded-br-2xl" : "rounded-tl-2xl rounded-bl-2xl"} mb-2.5 inline-flex justify-start items-center gap-2.5`}
          >
            <p
              className={`flex-1 opacity-90 justify-center text-Labels-Primary text-sm font-normal leading-snug ${isAgentMessage ? "text-black" : "text-black"}`}
            >
              {data.text}
            </p>      
          </div>
          {showTimestamp && (
            <p
              className={`text-[10px] ${isAgentMessage ? "text-start" : "text-end"} mb-1`}
            >
              {formatTime(data.timestamp)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

Message.propTypes = {
  data: PropTypes.any,
  prevMessage: PropTypes.any,
  nextMessage: PropTypes.any,
};
