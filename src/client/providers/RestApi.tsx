import axios from 'axios';

const queryParams = new URLSearchParams(window.location.search);
const conversationid: any = queryParams.get('conversationid');


const chatConnectorServer = axios.create({
  baseURL: 'https://chat-connector-dgabgde4fwdcd3cu.canadacentral-01.azurewebsites.net/',
  // baseURL: 'http://localhost:3333/',
  headers: { 'Content-Type': 'application/json' }
});

interface chatConnectorResponse {
  status: string,
  message: string,
  conversationId: string,
}

export const initChatConnectorSession = async () => {
  const data = {
    "conversationId": conversationid || "645dbba6-2baf-4712-bb4c-5e07e1fbc82c",
  }
  try {
    const response = await chatConnectorServer.post<chatConnectorResponse>("subscribe-conversation", data);
    console.log('chatConnectorServer..............'+new Date().toUTCString(), response.data);
    return response.data;
  } catch (error: any) {
    // throw new Error(error.response?.data?.message || 'some unknown error');
    console.error('chatConnectorServer..............'+new Date().toUTCString(), error.response?.data?.message || 'some unknown error');
  }
};
