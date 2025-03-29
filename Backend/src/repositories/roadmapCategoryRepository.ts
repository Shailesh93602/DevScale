import { PrismaClient } from "@prisma/client";
import BaseRepository from "./baseRepository";

const prisma = new PrismaClient();

export default class RoadmapCategoryRepository extends BaseRepository<PrismaClient['roadmapCategory']> {
  constructor() {
    super(prisma.roadmapCategory);
  }
}