

import {v4 as uuid} from "uuid";
import {useSocket as useSocketParent, useSocketEvent as useSocketEventParent} from "socket.io-react-hook";
import {createContext, useContext} from "react";

const queryParams = new URLSearchParams(window.location.search);
const conversationid: any = queryParams.get('conversationid') || uuid();

const SocketContext = createContext({
  socket: undefined,
  setSocket: (socket: any) => {
  }
});

export const useSocket = () => {
  let {socket, setSocket} = useContext(SocketContext);

  if (socket === undefined) {
    const {socket} = useSocketParent('');  // Connect to celery namespace
    socket.on('connect', () => {
      console.log("Connected to celery namespace with conversation ID:", conversationid);
      socket.emit("joinRoom", conversationid)
    });
    setSocket(socket);
  }

  return useSocketParent(socket);
};

export const useSocketEvent = (eventName: string) => {
  const {socket} = useSocket();
  return useSocketEventParent(socket, eventName);
}

export type SocketParameters = {
  quickActions: never[];
  options: never[];
  intentType: string;
  title: string;
  value: string;
  text: any;
  conversationStartTime:string;
  action_id: number;
  session_id: string;
  conversationid?: string;
};

export type SocketPayload = {
  type: string;
  parameters: SocketParameters;
  conversationEndTime: string;
};