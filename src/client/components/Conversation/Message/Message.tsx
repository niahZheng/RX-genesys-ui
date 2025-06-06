import PropTypes from "prop-types";
import { useEffect, useState } from "react";




const Message = ({ data }: any) => {
  const [isAgentMessage, setIsAgentMessage] = useState<boolean | null>(null);

  
  useEffect(() => {
    
    if (!data) return;
    setIsAgentMessage(data?.source === "agent");
    console.log("Message data:", data);
  }, [data]);

  if (isAgentMessage === null) {
    return <></>;
  }
  return (
    <div className={`flex ${isAgentMessage ? "justify-start" : "justify-end"}`}>
      <div className={`flex flex-col max-w-[80%]`}>
        <p
          className={`text-[10px] ${isAgentMessage ? "text-start" : "text-end"} mb-1`}
        >
          {isAgentMessage ? "Agent" : "Customer"}
        </p>
        <div
          className={`p-3 w-full max-w-72   ${
            isAgentMessage
              ? "bg-gray-300 border-gray-600"
              : "bg-purple-300 border-black"
          } ${isAgentMessage ? "rounded-r-lg rounded-bl-lg" : "rounded-tl-2xl rounded-tr-2xl"} mb-4 inline-flex justify-start items-center gap-2.5`}
        >
          <p
            className={`text-sm ${isAgentMessage ? "text-white" : "text-[#817EFF]"}`}
          >
            {data.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message;

Message.propTypes = {
  data: PropTypes.any,
};
