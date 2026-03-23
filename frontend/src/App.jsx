import { useRef, useState } from "react";
import bgImg from "../public/assets/peakpx.jpg";
import { connectWS } from "./socket";
import { useEffect } from "react";
import { toast } from "react-toastify";

const App = () => {
  const socket = useRef(null);
  const username = useRef(null);
  const chatMsg = useRef(null);

  const [popup, setpopup] = useState(true);
  const [name, setname] = useState(null);
  const [messages, setmessages] = useState([]);

  const [typers,setTypers] = useState([])

  const typingTimer = useRef(null)

 


  useEffect(() => {
    socket.current = connectWS();

    /** when server socket(client) connect to server , then e chalega */
    socket.current.on("connect", () => {
      // console.log("connected");
    });

    socket.current.on("roomNotice", (username) => {
      // console.log(`${username} , joined the group`);
      toast.success(`${username} joined the room`);
    });

    socket.current.on("chat-msg", (message) => {
      // console.log(message);
      setmessages((prev) => [...prev, message]);
    });

     
    socket.current.on("typing", (typeUser)=>{
        setTypers(prev=>{

           const isExits = prev.find(typer=>typer===typeUser)
           if(!isExits){
            return [...prev,typeUser]
           }
           else{
            return prev
           }
    
        })
    })


    socket.current.on("stopTyping", (typeUser) => {
  setTypers(prev => prev.filter(typer => typer !== typeUser));
});

/** cleanup/unsubscribe the events jo listen kar rahe hai */
return ()=>{
  socket.current.off("roomNotice")
  socket.current.off("chat-msg")
  socket.current.off("typing")
  socket.current.off("stopTyping")
}


  }, []);

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}.${minutes}`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = username.current.value;
    // console.log(name);
    setname(name);
    /** emit the username */
    socket.current.emit("joinRoom", name);
    username.current.value = null;
    setpopup(false);
  }

  function handleChatSubmit(e) {
    e.preventDefault();
    // console.log(chatMsg.current.value);
    const msg = {
      name,
      message: chatMsg.current.value,
      time: `${getCurrentTime()}`,
      sender: name,
    };
    setmessages([...messages, msg]);
    /** emit the message */
    socket.current.emit("chat-msg", msg);
    chatMsg.current.value = "";
  }



  function changeInputEventHandler(){
    // console.log('typing')
    socket.current.emit("typing",name);

    clearTimeout(typingTimer.current)

    typingTimer.current = setTimeout(()=>{
        socket.current.emit("stopTyping", name);
    },1000)

  }

  return (
    <div className="h-screen w-full">
      {/* popup for taking name from user  */}
      {popup && (
        <div className="popup bg-zinc-200 h-full w-full flex justify-center items-center">
          <div className=" w-100 bg-white shadow-2xl rounded-lg  py-5 px-7 flex flex-col gap-4">
            <h1 className="text-xl font-normal">Enter your name</h1>
            <span className="text-sm">
              Enter your name to start chatting . This will be used to identify
              you.
            </span>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
              <input
                ref={username}
                required
                minLength={4}
                type="text"
                placeholder="You name (e.g. John Doe)"
                className="px-3 py-2 outline-none border-green-300 border-2 rounded-md"
              />
              <button
                type="submit"
                className="px-3 py-1 self-end rounded-full bg-green-500 cursor-pointer text-white border-none w-fit"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* main chat application home page  */}
      {!popup && (
        <div
          style={{ backgroundImage: `url(${bgImg})` }}
          className="chat h-screen w-full  py-10 flex justify-center"
        >
          <div className="w-110 h-full rounded-xl overflow-hidden flex flex-col shadow-2xl bg-white">
            <div className="header w-full px-5 py-2 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-950 text-white flex justify-center items-center text-lg">
                  {name[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px]">Realtim group chat</span>
                  {typers.length>0 &&  <span className="text-[12px] text-zinc-500">
                    {typers.join(",")} is typing
                  </span>}
                 
                </div>
              </div>
              <div>
                <span className="text-[14px] text-zinc-500">
                  Signed as{" "}
                  <span className="font-bold text-zinc-800">{name}</span>
                </span>
              </div>
            </div>

            <div className="chatbox grow overflow-y-scroll bg-zinc-300 flex flex-col gap-5  px-2 py-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor:
                      msg.sender === name ? "#005C4B" : "#FFFFFF",
                  }}
                  className={`single-msg rounded-xl w-fit min-w-40 ${msg.sender === name ? "self-end text-white" : "self-start text-black"} p-2 max-w-75`}
                >
                  <span>{msg.message}</span>
                  <div className="mt-4 flex justify-between items-start">
                    <span className="text-zinc-300">{msg.name}</span>
                    <span className="text-zinc-300">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat w-full py-3 px-4 bg-white flex gap-2">
              <form onSubmit={handleChatSubmit} className="flex gap-2 w-full">
                <input
                  onChange={changeInputEventHandler}
                  ref={chatMsg}
                  required
                  className="rounded-full grow px-3 py-2 outline-none border border-zinc-400"
                  type="text"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="px-5 cursor-pointer text-sm rounded-full bg-green-500 text-white"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
