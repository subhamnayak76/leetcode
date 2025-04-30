import jwt from "jsonwebtoken";
import {Request,Response,NextFunction} from 'express'
import { tokenverification } from "../utils/jwt";
declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }
  
export const authenticate = (req:Request,res:Response,next:NextFunction) =>{
        const token = req.headers.authorization?.split('')[1]
        if(!token){
            res.status(400).json({msg : 'token missing '})
            return
        }
        try {
            const decode = tokenverification(token) as {id :string}
            req.userId = decode.id
            next()
        }catch (e){
            res.status(403).json({message:"token expired or invalid"})
        }


}    
        
