export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
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
  maxScore: number;
  date: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  scores: UserScore[];
} 