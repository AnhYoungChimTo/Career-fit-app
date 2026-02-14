-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "securityQuestion" TEXT NOT NULL,
    "securityAnswerHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL DEFAULT 'deep',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "currentModule" TEXT,
    "currentQuestion" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "personalityData" JSONB,
    "talentsData" JSONB,
    "valuesData" JSONB,
    "sessionData" JSONB,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "aScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "a1Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "a2Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "a3Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'medium',
    "careerMatches" JSONB NOT NULL,
    "topCareer" TEXT NOT NULL,
    "topFitScore" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vietnameseName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "avgSalaryVND" TEXT,
    "workHoursPerWeek" INTEGER,
    "stressLevel" TEXT,
    "growthPotential" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE INDEX "Interview_interviewType_idx" ON "Interview"("interviewType");

-- CreateIndex
CREATE INDEX "Result_interviewId_idx" ON "Result"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Career_name_key" ON "Career"("name");

-- CreateIndex
CREATE INDEX "Career_name_idx" ON "Career"("name");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
