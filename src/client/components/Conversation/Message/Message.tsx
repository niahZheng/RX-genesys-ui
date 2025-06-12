import PropTypes from "prop-types";
import { useEffect, useState } from "react";




const Message = ({ data }: any) => {
  const [isAgentMessage, setIsAgentMessage] = useState<boolean | null>(null);

  
  useEffect(() => {
    
    if (!data) return;
    setIsAgentMessage(data?.source === "internal");
    console.log("Message data:", data);
  }, [data]);

  if (isAgentMessage === null) {
    return <></>;
  }
  return (
  <div className="self-stretch flex flex-col justify-start  gap-0.5">
    <div className={`flex ${isAgentMessage ? "justify-start" : "justify-end"} `}>
      <div className={`flex flex-col max-w-[100%]`}>
        <p
          className={`text-[10px] ${isAgentMessage ? "text-start" : "text-end"} mb-1`}
        >
          {isAgentMessage ? "external" : "you"}
        </p>
        <div
          className={`p-3 w-full max-w-72   ${
            isAgentMessage
              ? "bg-gray-300 border-gray-600"
              : "bg-purple-300 border-black"
          } ${isAgentMessage ? "rounded-tr-2xl rounded-bl-2xl rounded-br-2xl" : "rounded-tl-2xl rounded-bl-2xl rounded-br-2xl"} mb-2.5 inline-flex justify-start items-center gap-2.5`}
        >
          <p
            className={`flex-1 opacity-90 justify-center text-Labels-Primary text-sm font-normal leading-snug ${isAgentMessage ? "text-black" : "text-black"}`}
          >
            {data.text}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Message;

Message.propTypes = {
  data: PropTypes.any,
};
