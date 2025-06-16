import axios from 'axios';

const queryParams = new URLSearchParams(window.location.search);
const conversationid: any = queryParams.get('conversationid');


const chatConnectorServer = axios.create({
  baseURL: 'https://chat-connector-dgabgde4fwdcd3cu.canadacentral-01.azurewebsites.net/',
  // baseURL: 'http://localhost:3333/',
  headers: { 'Content-Type': 'application/json' }
});

interface chatConnectorResponse {
  error?: string,
  status: string,
  message: string,
  conversationId?: string,
}

const fakeIdList = [
  "c03dc580-1de3-4df8-9d73-5ee25472621d",
  "b626d4b9-20f7-4ebf-bcea-b8cf3b1b336c",
  "7175d26a-c14f-4d49-989e-aee5748e9274",
]

export const initChatConnectorSession = async () => {
  const index = Math.floor(Math.random() * fakeIdList.length);
  const data = {
    "conversationId": conversationid || fakeIdList[index],
  }
  try {
    const response = await chatConnectorServer.post<chatConnectorResponse>("subscribe-conversation", data);
    console.log('chatConnectorServer..............' + new Date().toUTCString(), response.data);
    return response.data;
    // return { 
    //   error: "error.message",
    //   status: "error",
    //   message: "Internal server error",
    // }
  } catch (error: any) {
    const err_msg = error.response?.data?.message || 'some unknown error';
    console.error('chatConnectorServer..............' + new Date().toUTCString(), err_msg);
    return {
      error: err_msg,
      status: "error",
      message: "client side error",
    }
  }
};
