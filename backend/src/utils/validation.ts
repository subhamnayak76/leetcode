import { Language } from "@prisma/client"
import {z} from "zod"
export const registerSchema = z.object({
    email : z.string().email({message: "wrong email "}),
    name :z.string().min(1,{message:"Name is required"}),
    password : z.string().min(6,{message:"min 6 chars required in for password"})
})


export const loginSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6,{message:"min 6 chars required in for password"})
})
    
export const submitSchema = z.object({
    code : z.string().min(1,{message : "provide code "}),
    language : z.string().min(1,{message : "provide the code language"}),
    problemid: z.string().min(1,{message: "add the problemid"}),
    userId : z.string().min(1,{message : 'provide the user id'})

})