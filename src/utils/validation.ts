import {z} from "zod"
export const registerSchema = z.object({
    email : z.string().email({message: "wrong email "}),
    name :z.string().min(1,{message:"Name is required"}),
    password : z.string().min(6,{message:"min 6 chars required in for password"})
})
