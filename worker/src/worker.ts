
import { Worker } from "bullmq"
import { redisConfig } from "./config/config"
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

const execPromise = promisify(exec)
const prisma = new PrismaClient()

async function getTemplate(problemName: string) {
  const templates: { [key: string]: string } = {
    'two sum': 'twoSum.js',
    'palindrome number': 'palindrome.js',
  }

  const templateFile = templates[problemName.toLowerCase()] || 'twoSum.js'
  const templatePath = path.join(__dirname, 'templates', templateFile)
  return await fs.readFile(templatePath, 'utf8')
}

function injectUserCode(template: string, userCode: string): string {
  return template.replace('// USER_CODE_PLACEHOLDER - DO NOT REMOVE THIS LINE', userCode)
}

const worker = new Worker('submit', async (job) => {
  try {
    console.log(`Worker running job ${job.id}`)
    const { submissionId } = job.data
    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId
      },
      include: {
        problem: {
          include: {
            testCases: true
          }
        }
      }
    })
    
    if (!submission) {
      console.log("No submission found")
      return { error: "submission not found" }
    }

    const template = await getTemplate(submission.problem.title)
    const combinedCode = injectUserCode(template, submission.code)
    
    const filename = `temp_${submissionId}.js`
    await fs.writeFile(filename, combinedCode)
    
    // Process each test case
    const testResults = []
    let allPassed = true
    
    for (const test of submission.problem.testCases) {
      try {
        const inputArgs = test.input.replace(/\n/g, ' ')
        const { stdout, stderr } = await execPromise(`node ${filename} ${inputArgs}`)
        
        const output = stdout.trim()
        const expected = test.expectedOutput.trim()
        const passed = output === expected
        
        if (!passed) {
          allPassed = false
        }
        
        testResults.push({
          testCaseId: test.id,
          passed,
          output,
          expected
        })
      } catch (error: any) {
        allPassed = false
        testResults.push({
          testCaseId: test.id,
          passed: false,
          error: error.message || String(error),
          output: 'ERROR',
          expected: test.expectedOutput.trim()
        })
      }
    }
    
    // Update the submission in database
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: allPassed ? 'PASSED' : 'FAILED',
        userOutput: JSON.stringify(testResults)
      }
    })
    
    // Clean up temp file
    await fs.unlink(filename).catch(() => {})
    
    return { success: true, passed: allPassed, results: testResults }
  } catch (e: unknown) {
    console.log('Worker error:', e)
    
    // Update submission with error status if possible
    if (job.data?.submissionId) {
      await prisma.submission.update({
        where: { id: job.data.submissionId },
        data: {
          status: 'FAILED',
          errorOutput: e instanceof Error ? e.message : String(e)
        }
      }).catch(() => {})
    }
    
    return { error: e instanceof Error ? e.message : String(e) }
  }
}, { connection: redisConfig })

worker.on('completed', job => {
  console.log(`Job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Worker started and waiting for jobs...')

