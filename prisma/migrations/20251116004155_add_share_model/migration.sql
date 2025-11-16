-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "shareId" TEXT NOT NULL,
    "folderId" INTEGER NOT NULL,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Share_shareId_key" ON "Share"("shareId");

-- CreateIndex
CREATE UNIQUE INDEX "Share_folderId_key" ON "Share"("folderId");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
