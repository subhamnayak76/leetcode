import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import bcrypt, { compare } from "bcryptjs"
import { Request,Response } from "express";
import { loginSchema, registerSchema } from "../utils/validation";
import { generatetoken } from "../utils/jwt";
import { addtoqueue } from "../service/processQueue";
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
export const login = async (req:Request,res:Response) =>{
    try{
        const result = loginSchema.safeParse(req.body)
        if(!result.success){
            res.status(400).json({
                error:"validation failed",
                details :result.error.format()
            })
            return
        }
        const {email,password} = result.data
        const existinguser = await prisma.user.findUnique({
            where : {
               email 
            }
        })
       
        if(!existinguser){
            res.status(404).json({msg: "not register "})
            return
        }
         const hashpass = existinguser?.password || ''
        const credentials = await bcrypt.compare(password,hashpass)
        if(!credentials){
            res.status(401).json({error : "invalid credentials"})
            return
        }
        const token = generatetoken(existinguser.id)

        res.status(200).json({'token':token})

        
        
    }catch(e){
        console.log('error in the login',e)
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

    await addtoqueue(submission.id)
    console.log('added to the queue')

    res.status(201).json({
        msg : 'recive submision',
        submission :{
            id : submission.id,
            code : submission.code,
            language : submission.language

        }
    })
}