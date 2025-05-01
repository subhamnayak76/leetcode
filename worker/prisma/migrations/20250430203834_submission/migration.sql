-- CreateTable
CREATE TABLE "_SubmissionToTestCase" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubmissionToTestCase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SubmissionToTestCase_B_index" ON "_SubmissionToTestCase"("B");

-- AddForeignKey
ALTER TABLE "_SubmissionToTestCase" ADD CONSTRAINT "_SubmissionToTestCase_A_fkey" FOREIGN KEY ("A") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmissionToTestCase" ADD CONSTRAINT "_SubmissionToTestCase_B_fkey" FOREIGN KEY ("B") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
