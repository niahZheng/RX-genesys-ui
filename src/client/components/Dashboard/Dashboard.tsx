import NextBestActions from "@client/components/NextBestActions/NextBestActions";
import CallSummary from "@client/components/CallSummary/CallSummary";

import * as styles from "./Dashboard.module.scss";
import Conversation from "@client/components/Conversation/Conversation";
import { AccordionProvider } from "@client/context/AccordionContext";
import { initChatConnectorSession } from "@client/providers/RestApi";
import { useEffect, useState } from "react";
import { Button, ComposedModal, ModalFooter } from "@carbon/react";

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
      <ComposedModal open={open} onClose={onClose} isFullWidth={true} >
        <div className="px-[32px] py-[16px] opacity-90 justify-center text-Labels-Primary text-xl font-bold">{errorMessage}</div>
        <ModalFooter>
          <Button kind="primary" onClick={onClose}>
            Click to initiate Genesys sessiion again.
          </Button>
        </ModalFooter>
      </ComposedModal>
      <div className="w-[601px] h-[882px] bg-white">
        <div className="flex h-full gap-[19px] px-[14px]">
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
    </>
  );
};

export default Dashboard;