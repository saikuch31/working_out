/*
  Warnings:

  - You are about to drop the `WorkoutEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkoutEntry";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight" INTEGER,
    "totalWeight" INTEGER,
    CONSTRAINT "Exercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
