import NextBestActions from "@client/components/NextBestActions/NextBestActions";
import CallSummary from "@client/components/CallSummary/CallSummary";

import * as styles from "./Dashboard.module.scss";
import Conversation from "@client/components/Conversation/Conversation";
import { AccordionProvider } from "@client/context/AccordionContext";
import { initChatConnectorSession } from "@client/providers/RestApi";
import { useEffect, useState } from "react";
import { Button, ComposedModal, ModalFooter } from "@carbon/react";
import { MisuseOutline, Warning } from "@carbon/icons-react";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    initChatConnectorSession().then((result) => {
      if (result?.status === "error") {
        setErrorMessage(result.message + ": " + result.error);
        setOpen(true);
      }
    })
  }, []);

  const onClose = () => {
    setOpen(false);
    setErrorMessage("");
    
    initChatConnectorSession().then((result) => {
      if (result?.status === "error") {
        setErrorMessage(result.message + ": " + result.error);
        setOpen(true);
      }
    })
  }

  return (
    <>
      <div className="w-[601px] h-[882px] bg-white">
        <div className="flex flex-col h-full px-[14px]">
          {/* 错误信息部分 */}
          {open && (
            <div className="pt-5 bg-Surface-Card inline-flex flex-col justify-center items-end gap-2">
              <div className="flex flex-col w-full gap-2.5">
                <div className="self-stretch min-w-48 px-4 py-2 bg-pink-50 outline outline-b-2 outline-red-400 inline-flex justify-center items-start gap-4 h-14 mt-[19px] mt-[14px]">
                  <div className="flex-1 py-0.5 flex justify-center items-start gap-2.5">
                    <div className="w-6 py-0.5 flex justify-start items-center gap-2.5">
                      <div className="flex-1 inline-flex flex-col justify-center items-center gap-2.5">
                        <Warning style={{ color: "#E97075" }} />
                      </div>
                    </div>
                    <div className="flex-1 flex justify-start items-start gap-2">
                      <div className="flex-1 justify-start text-black text-xs font-normal leading-none">
                        {errorMessage}
                      </div>
                    </div>
                  </div>
                  <div className="py-2 flex justify-start items-center gap-2.5">
                    <div className="w-4 flex justify-start items-center gap-3">
                      <div
                        className="w-4 h-4 relative overflow-hidden cursor-pointer"
                        onClick={() => setOpen(false)}
                      >
                        <MisuseOutline style={{ color: "#E97075" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 主要内容区域 */}
          <div className="flex gap-[19px]">
            <div className="w-[300px]">
              <Conversation />
            </div>
            <div className="w-[254px]">
              <AccordionProvider>
                <NextBestActions />
                <CallSummary />
              </AccordionProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;