const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs').promises;
const { exec } = require('child_process');

async function codeExcution() {
  try {
  
    const submission = await prisma.submission.findUnique({
      where: {
        id: ""
      }
    });
    
    if (!submission) {
      console.log("Submission not found");
      return;
    }

    
    const fileName = "temp_code.js";
    await fs.writeFile(fileName, submission.code);
    
    
    exec(`node ${fileName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(`Output: ${stdout}`);
      
      
      fs.unlink(fileName).catch(err => console.error("Cleanup error:", err));
    });
  } catch (err) {
    console.error("Execution failed:", err);
  }
}

codeExcution();

