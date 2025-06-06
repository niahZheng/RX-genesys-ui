
import {Column, Grid} from "@carbon/react";
import NextBestActions from "@client/components/NextBestActions/NextBestActions";
import CallSummary from "@client/components/CallSummary/CallSummary";

import * as styles from "./Dashboard.module.scss";
import Conversation from "@client/components/Conversation/Conversation";
import { AccordionProvider } from "@client/context/AccordionContext";

const Dashboard = () => {
  return (
    
    <Grid className="bg-white">
      <Column sm={4} md={4}>
        <Conversation/>
      </Column>
      <Column sm={4} md={4}>
      <AccordionProvider>
        <NextBestActions/>
        <CallSummary/>
      </AccordionProvider>
      </Column>
    </Grid>
    // <div>
    //   <div>
    //   <Conversation/>
    //   </div>
    //   <div>
    //     <AccordionProvider>
    //       <NextBestActions/>
    //       <CallSummary/>
    //     </AccordionProvider>
    //   </div>
    // </div>

  );
};

export default Dashboard;