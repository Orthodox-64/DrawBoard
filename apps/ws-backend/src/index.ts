import {WebSocketServer} from "ws";
import jwt from "jsonwebtoken";
const PORT=8080;
import { JWT_SECRET } from "@repo/backend-common";

const wss=new WebSocketServer({port:PORT});

wss.on('connection',(ws,request)=>{
    const url=request.url;
    if(!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split('?')[1]);
    const token=queryParams.get('token')|| "";
    const decoded=jwt.verify(token,JWT_SECRET)
    console.log("New Client Connected");
    ws.send("Welcome to Gang!!")

    if(typeof decoded ==="string"){
        return;
    }

    ws.on('message',(message)=>{
        console.log(`Received message => ${message}`);
        ws.send(`You sent => ${message}`);
    });

   if(!decoded || !decoded.userId) {
        ws.send("Invalid token");
        ws.close();
        return;
    }
})

console.log(`WebSocket server is running on ws://localhost:${PORT}`);