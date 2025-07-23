

import {EnvVarsProvider} from "@client/providers/EnvVars";
import { IoProvider } from 'socket.io-react-hook';
import { SummaryProvider } from '@client/context/SummaryContext';

export const AppProvider = (props: any) => (
  <EnvVarsProvider>
    <IoProvider>
      <SummaryProvider>
        {props.children}
      </SummaryProvider>
    </IoProvider>
  </EnvVarsProvider>
);