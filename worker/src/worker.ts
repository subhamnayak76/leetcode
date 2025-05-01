import { Worker } from "bullmq"
import { redisConfig } from "./config/config"
import {PrismaClient} from '@prisma/client'
import {exec} from 'child_process'
import fs from 'fs/promises'


const prisma = new PrismaClient()
const worker = new Worker('submit',async (job)=>{
    try{
    console.log(`the worker is running in ${job.id}`)
    const {submissionId} = job.data
    const submission = await prisma.submission.findUnique({
        where :{
            id : submissionId
       },
       include : {
        problem : {
            include: {
                testCases :true
            }
        }
       }

    })
    console.log(submission?.problem.testCases)
    if(!submission){
        console.log("No submission found")
        return {error :" submission not found"}
    }
    const filename = 'temp_file.js'
    await fs.writeFile(filename,submission.code)
    
    console.log("running code for submission")
    let store =''
    exec(`node ${filename}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        store = stdout
      });

    //   for(const test of submission.problem.testCases){
    //     const output = store.trim()
    //     const expected = test.expectedOutput.trim()
    //     const 
    //   }
    }catch(e) {
        console.log('error while excuting the code ',e)
    }
},
{connection :redisConfig}
)


