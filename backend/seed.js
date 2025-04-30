const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


const data = [
  {
    title: "two sum",
    description: "find two number that add up to target",
    difficulty: "EASY",
    testCases: [
      { input: "2 7 11 15\n9\n", expectedOutput: "0 1" },
      {
        input: "3 2 4\n6\n",
        expectedOutput: "1 2",
      },
      {
        input: "1 2 3\n7\n",
        expectedOutput: "",
      },
    ],
  },
];

async function  seed_test_db() {
    for(const problem of data){
        const createproblem = await prisma.problem.create({
            data : {
                title : problem.title,
                description: problem.description,
                difficulty: problem.difficulty,
                testCases : {
                    create : problem.testCases.map((testCase) =>({
                        input : testCase.input,
                        expectedOutput : testCase.expectedOutput
                    }))
                }
            }
        })
        console.log('created problem',createproblem.title)

    }
    

}


seed_test_db()