import NextBestActions from "@client/components/NextBestActions/NextBestActions";
import CallSummary from "@client/components/CallSummary/CallSummary";

import * as styles from "./Dashboard.module.scss";
import Conversation from "@client/components/Conversation/Conversation";
import { AccordionProvider } from "@client/context/AccordionContext";

const Dashboard = () => {
  return (
    <div className="w-[601px] h-[882px] bg-white">
      <div className="flex h-full gap-[19px] px-[14px]">
        <div className="w-[300px]">
          <Conversation/>
        </div>
        <div className="w-[254px]">
          <AccordionProvider>
            <NextBestActions/>
            <CallSummary/>
          </AccordionProvider>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;