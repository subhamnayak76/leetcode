import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import bcrypt from "bcryptjs"
import { Request,Response } from "express";
import { registerSchema } from "../utils/validation";
export const register = async(req:Request,res:Response) =>{
    try{
        const result = registerSchema.safeParse(req.body)
        if(!result.success){
            res.status(400).json({
                error:"validation failed",
                details :result.error.format()
            })
            return
        }
        const {email,name,password} = result.data
        const existinguser = await prisma.user.findUnique({
            where :{
                email
            }
        })
        if(existinguser){
            res.status(409).json({msg:"user is already registered"})
            return
        }
        const salt = await bcrypt.genSalt(10)
        const hashpass = await bcrypt.hash(password,salt)
        const user = await prisma.user.create({
            data : {
                email,
                name,
                password : hashpass
            }
        })
        res.status(201).json({ 
            message: "User registered successfully",
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }

    })
} catch (e){
    console.log("registration error",e)
    res.status(500).json({ error: "Failed to register user" });
  }

} 


export const submit = async (req:Request,res:Response) =>{
    const {code,language,problemId,userId} = req.body
    const problem = await prisma.problem.findUnique({
        where :{
            id : problemId
        }
    })
    if(!problem){
        res.status(400).json({msg:"problem not found"})
        return
    }

    const submission = await prisma.submission.create({
        data :{
            code,
            language,
            userId,
            problemId

        }
    })

    res.status(201).json({
        msg : 'recive submision',
        submission :{
            id : submission.id,
            code : submission.code,
            language : submission.language

        }
    })
}