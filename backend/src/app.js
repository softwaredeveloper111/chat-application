import express from "express";
import cors from "cors"




const app = express();


/** application middleware */
app.use(cors({
  origin:"https://chat-application-b8js.onrender.com",
  credentials:true
}))







/** health check router */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});





export default app;