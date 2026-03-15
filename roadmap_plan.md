# Roadmap Data Restructuring Plan

We have identified that the current seeded roadmap data is potentially corrupted or incomplete, with incorrect ID mappings in the junction tables (like `MainConceptSubject`) which leads to UI bugs (like the "Subject not found" error). To fix this comprehensively, we will completely clean up the existing roadmap data and write a robust seeder for 3 to 5 modern, fully-fleshed-out roadmaps.

## 1. Objective
Replace all existing, corrupted roadmap data with 3-5 pristine, deeply nested roadmaps to ensure the application perfectly demonstrates its core value.

## 2. Requirements for the Seeded Roadmaps
Each of the 3-5 roadmaps MUST contain a complete hierarchical chain:
1. **Roadmap** (Title, description, category, difficulty, etc.)
2. **Main Concepts** (Broad modules within the roadmap)
3. **Subjects** (Specific areas within a Main Concept)
4. **Topics** (Granular learning points within a Subject)
5. **Articles & Quizzes** (The actual learning content attached to a Topic)

*We will ensure that all foreign keys and junction tables link the correct Prisma models together so the frontend can query data seamlessly.*

## 3. The 3-5 Target Roadmaps
*Suggesting these highly demanded modern roles for our seed data:*
1. **Full-Stack Web Development (React & Node.js)**
2. **Modern Data Engineering**
3. **Cloud & DevOps Engineering**
4. (Optional) AI/Machine Learning Engineering
5. (Optional) Mobile App Development (React Native / Flutter)

## 4. Execution Steps

### Step A: Define Data Structures (JSON/TS Objects)
- Create or modify the existing resource files (e.g., in `Backend/prisma/resources/roadmaps/`) to clearly explicitly define the full tree structure: Roadmap -> MainConcepts -> Subjects -> Topics -> Articles -> Quizzes.
- Write robust placeholder templates for Articles and Quizzes so every topic is populated.

### Step B: Database Cleanup Strategy
- In the new seeder, forcefully `deleteMany` on the following tables to ensure a clean slate before inserting:
  - `UserProgress` (if tied to deleted topics)
  - `Article` & `Quiz`
  - `RoadmapTopic`, `SubjectTopic`, `MainConceptSubject`, `RoadmapMainConcept` (Junction tables)
  - `Topic`, `Subject`, `MainConcept`
  - `Roadmap` and `RoadmapCategory`
*(Note: We will do this carefully so we don't accidentally wipe out users, but we want a perfectly clean slate for educational content).*

### Step C: Write the Master Roadmap Seeder
- Create a new, single sequential seeder file: `Backend/prisma/seeders/masterRoadmap.seeder.ts`.
- Insert data hierarchically:
  1. Insert Category.
  2. Insert Roadmap.
  3. Loop Main Concepts -> Insert Main Concept -> Insert Junction `RoadmapMainConcept`.
  4. Loop Subjects -> Insert Subject -> Insert Junction `MainConceptSubject`.
  5. Loop Topics -> Insert Topic -> Insert Junction `SubjectTopic` & `RoadmapTopic`.
  6. Loop Articles/Quizzes -> Insert and tie to `Topic.id`.

### Step D: Update `seed.ts`
- Alter the main `prisma/seed.ts` file to call our new robust `masterRoadmap.seeder.ts` instead of the scattered/old broken seeders.

### Step E: Database Reset & Run
- Run the reset script locally and verify data integrity via `prisma studio` and the frontend application.

## 5. Timeline / Next Actions
Please confirm if this plan aligns with your expectations, or if you have specific roadmaps you want included in the 3-5 list besides the suggestions above. Once confirmed, we will begin writing the data structures and the master seeder script.
