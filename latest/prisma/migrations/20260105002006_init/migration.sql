-- CreateTable
CREATE TABLE "WorkoutEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
