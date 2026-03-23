import "dotenv/config"
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from 'socket.io';




const port  = process.env.PORT || 7000;
const server = createServer(app);
const io = new Server(server,{
  cors:{
    origin:"https://chat-application-b8js.onrender.com"
  }
});


const roomName = "golu's space"
io.on('connection', (socket) => {
  // console.log('a user connected',socket.id);


  socket.on("joinRoom", async (userName)=>{
      // console.log(`${userName} is join the room golu's space`)
      await socket.join(roomName);

      //send to all including sender
      // io.to(roomName).emit("roomNotice", userName);

      // send to all except the sender - broadcast
         socket.to(roomName).emit("roomNotice", userName);
  })
  

  socket.on("chat-msg",(message)=>{

    //broadcast the message
    socket.to(roomName).emit("chat-msg", message);
  })



  socket.on("typing",(username)=>{
    socket.to(roomName).emit("typing", username);
  })


   socket.on("stopTyping",(username)=>{
    socket.to(roomName).emit("stopTyping", username);
  })


});




server.listen(port,()=>{
  console.log(`your server is running at port ${port}`)
})