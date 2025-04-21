export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  image?: string; // URL ou données base64 de l'image pour la question
}

// quiz-app/types/index.ts

export interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  difficulty: string;
  questions: Question[];
  image: string; // URL ou données base64 de l'image
}

export interface UserScore {
  quizId: number;
  score: number;
  date: string;
}

export interface AnswerDetail {
  questionIndex: number;
  timeSpent: number;
  correct: boolean;
}

export interface User {
  id: number;
  username: string;
  password: string;
  scores: UserScore[];
  scoreDetails?: { [quizId: number]: AnswerDetail[] };
  createdAt: string;
} 