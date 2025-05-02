// USER_CODE_PLACEHOLDER - DO NOT REMOVE THIS LINE

// Main execution logic
function main() {
    try {
      // Parse input from command line arguments
      const args = process.argv.slice(2);
      const input = args.join(' ');
      
      
      let lines = input.trim().split('\n');
      if (lines.length === 1) {
    
        const parts = lines[0].trim().split(' ');
        const target = parts.pop();
        lines = [parts.join(' '), target];
      }
      
      
      const nums = lines[0].split(' ').map(Number);
      const target = parseInt(lines[1]);
      
      
      const result = twoSum(nums, target);
      
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log(result.join(' '));
      } else {
        console.log('');
      }
    } catch (error) {
      console.error('Error in execution:', error);
      console.log(''); 
    }
  }
  
  
  main();