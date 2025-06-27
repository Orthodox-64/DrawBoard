import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

export interface AuthenticatedRequest extends Request{
    userId?:string;
}

export const userMiddleware=(
     req:AuthenticatedRequest,
     res:Response,
     next:NextFunction
)=>{
    const authHeader=req.headers['authorization'];
    if (!authHeader) {
         res.status(401).json({ msg: "Authorization header missing" });
         return;
    }
    const token = authHeader;
    if (!token) {
      res.status(401).json({ msg: "Token missing" });
      return;
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId?: string };
      if (!decoded || !decoded.userId) {
           res.status(401).json({ msg: "Invalid token payload" });
           return;
      }
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Invalid or expired token" });
      return;
    }
}