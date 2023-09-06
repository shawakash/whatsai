-- CreateTable
CREATE TABLE "User" (
    "ProfileName" TEXT NOT NULL,
    "WaId" TEXT NOT NULL,
    "Number" INTEGER NOT NULL,
    "AccountSid" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_WaId_key" ON "User"("WaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Number_key" ON "User"("Number");

-- CreateIndex
CREATE UNIQUE INDEX "User_AccountSid_key" ON "User"("AccountSid");
