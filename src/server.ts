import express from 'express'
import { PrismaClient } from '@prisma/client'
import router from './routes/apiRoutes'
const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.get('/health',(req,res)=>{
    res.status(200).json({msg:"health ok"})
})

app.use('/api/v1',router)
app.get('/problem',async(req,res) =>{
    const problem = await prisma.problem.findMany({})
    res.status(200).json({data : problem})
})
app.listen(3000,()=>{
    console.log("serving from the port 3000")
})


