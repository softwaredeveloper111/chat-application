import { io } from "socket.io-client";


export function connectWS(){

  const socket = io('https://chat-application-b8js.onrender.com');   

  return socket;

}


