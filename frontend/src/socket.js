import { io } from "socket.io-client";


export function connectWS(){

  const socket = io();   

  return socket;

}


