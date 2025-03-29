import { PrismaClient } from "@prisma/client"
import BaseRepository from "./baseRepository"

const prisma = new PrismaClient();

export default class QuizAnswerRepository extends BaseRepository<
  PrismaClient["quizAnswer"]
> {
  constructor() {
    super(prisma.quizAnswer);
  }
}