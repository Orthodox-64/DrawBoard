import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import {PrismaClient} from "@repo/db"
import cors from "cors";
import {CreateUserSchema,SigninSchema,CreateRoomSchema} from "@repo/common/types"
import {userMiddleware} from "./middleware"

const prisma=new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup",async(req:any,res:any)=>{
    const parseResult=CreateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
         res.status(400).json({ error: parseResult.error.errors });
         return;
    }
    const name=parseResult.data.username;
    const password=parseResult.data.password;
    const user=await prisma.user.create({
        data:{name,password},
    })
    const token=jwt.sign({userId:user.id},JWT_SECRET,{expiresIn:"24h"});
    res.json({
        token:token
    })
})

app.post("/signin",async(req,res)=>{
    const parseResult=SigninSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors });
        return;
    }
    const name=parseResult.data.username;
    const password=parseResult.data.password;
    const user=await prisma.user.findFirst({where:{name}});
    if(!user){
        res.status(404).json({
            msg:"User Not found"
        });
        return;
    }
    try{
        const firstPass=user.password;
        if(firstPass!=password){
            res.json({
                msg:"Invalid Credentials"
            });
            return;
        }
        const token=jwt.sign({userId:user.id},JWT_SECRET,{expiresIn:"24h"});
        res.json({
            token:token
        });
    }catch(e){
        console.log("Error Occured"+e);
    }
})

app.post("/room",userMiddleware,async(req,res)=>{
    const parseResult=CreateRoomSchema.safeParse(req.body);
    if (!parseResult.success) {
         res.status(400).json({ error: parseResult.error.errors });
         return;
      }
      const roomName=parseResult.data.roomName;
      try{
        const room=await prisma.room.create({
            data:{
                roomName,
            },
        });
        res.json({room});
      }
      catch(e){
        console.log("Error occured"+e);
      }
})


app.listen(3001,()=>{
    console.log("Server is running on port 3001");
})