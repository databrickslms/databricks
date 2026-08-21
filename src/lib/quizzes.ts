import 'server-only'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Question } from '@/components/quiz'

const cache = new Map<string, Record<string, Question[]>>()

/** Knowledge-check questions for one module, keyed by module number in quizzes.json. */
export function loadQuiz(courseId: string, moduleNum: number): Question[] {
  let quizzes = cache.get(courseId)
  if (!quizzes) {
    const path = join(process.cwd(), 'content', 'courses', courseId, 'quizzes.json')
    quizzes = existsSync(path)
      ? (JSON.parse(readFileSync(path, 'utf8')) as Record<string, Question[]>)
      : {}
    cache.set(courseId, quizzes)
  }
  return quizzes[String(moduleNum)] ?? []
}
