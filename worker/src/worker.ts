import { Worker } from "bullmq"
import { redisConfig } from "./config/config"
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

// Convert exec to Promise
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
    
    console.log(`Submission details:`, {
      id: submissionId,
      problemTitle: submission?.problem.title,
      testCaseCount: submission?.problem.testCases.length
    })
    
    if (!submission) {
      console.log("No submission found")
      return { error: "submission not found" }
    }
    

    const template = await getTemplate(submission.problem.title)
    console.log(`Template loaded for ${submission.problem.title}`)
    
    const combinedCode = injectUserCode(template, submission.code)
    console.log("User code injected into template")
    
    
    const filename = `temp_${submissionId}.js`
    await fs.writeFile(filename, combinedCode)
    console.log(`Temporary file created: ${filename}`)
    
    // Process each test case
    const testResults = []
    let allPassed = true
    
    console.log("--- RUNNING TEST CASES ---")
    
    for (const [index, test] of submission.problem.testCases.entries()) {
      console.log(`\nRunning test case ${index + 1}:`)
      console.log(`Input: "${test.input.trim()}"`)
      console.log(`Expected: "${test.expectedOutput.trim()}"`)
      
      try {
        
        const inputArgs = test.input.replace(/\n/g, ' ')
        const { stdout, stderr } = await execPromise(`node ${filename} ${inputArgs}`)
        
        
        const output = stdout.trim()
        const expected = test.expectedOutput.trim()
        const passed = output === expected
        
        if (!passed) {
          allPassed = false
        }
        
        console.log(`Test ${index + 1} result: ${passed ? 'PASSED ✅' : 'FAILED ❌'}`)
        console.log(`- Expected: "${expected}"`)
        console.log(`- Received: "${output}"`)
        
        if (stderr) {
          console.log(`- Stderr: ${stderr}`)
        }
        
        testResults.push({
          testCaseId: test.id,
          passed,
          output,
          expected
        })
      } catch (error: any) {
        console.error(`Test ${index + 1} execution error:`, error)
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
    
    console.log("\n--- TEST SUMMARY ---")
    console.log(`Overall result: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`)
    console.log(`Total tests: ${testResults.length}`)
    console.log(`Passed: ${testResults.filter(r => r.passed).length}`)
    console.log(`Failed: ${testResults.filter(r => !r.passed).length}`)
    
    
    const resultData = {
      status: allPassed ? 'PASSED' : 'FAILED',
      userOutput: JSON.stringify(testResults)
    }
    
    console.log("Would update submission with:", resultData)
    
    
    await fs.unlink(filename).catch(e => console.log(`Failed to clean up file ${filename}:`, e))
    console.log(`Temporary file ${filename} removed`)
    
    return { success: true, passed: allPassed, results: testResults }
  } catch (e: unknown) {
    console.log('Worker error:', e)
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

export default worker