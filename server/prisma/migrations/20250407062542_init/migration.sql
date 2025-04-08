-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" SERIAL NOT NULL,
    "filePath" TEXT NOT NULL,
    "vulnerabilityType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPatch" (
    "id" SERIAL NOT NULL,
    "vulnerabilityId" INTEGER NOT NULL,
    "suggestedPatch" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiPatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "AiPatch" ADD CONSTRAINT "AiPatch_vulnerabilityId_fkey" FOREIGN KEY ("vulnerabilityId") REFERENCES "Vulnerability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
