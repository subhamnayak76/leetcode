import { Queue } from 'bullmq';
import { redisConfig } from '../config/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
const queue = new Queue('submit', { connection: redisConfig });


export const addtoqueue = async (submissionId :string) =>{
    await queue.add('processSubmission',{submissionId})
}

