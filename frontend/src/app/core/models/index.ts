export type ExerciseType =
  | 'multiple-choice'
  | 'match-pairs'
  | 'fill-the-blank'
  | 'true-false'
  | 'order-steps'
  | 'prompt-builder';

export interface ExerciseOption {
  id: string;
  text: string;
}
export interface MatchPair {
  id: string;
  left: string;
  right: string;
}
export interface OrderItem {
  id: string;
  text: string;
}
export interface PromptSlot {
  id: string;
  label: string;
}
export interface PromptSuggestion {
  id: string;
  text: string;
}

export interface ExerciseConfig {
  id: string;
  type: ExerciseType;
  question: string;
  explanation?: string;
  weight?: number;
  // multiple-choice
  options?: ExerciseOption[];
  correctOptions?: string[];
  multiple?: boolean;
  // match-pairs
  pairs?: MatchPair[];
  // fill-the-blank
  sentence?: string;
  acceptedAnswers?: string[];
  // true-false
  statement?: string;
  correctBool?: boolean;
  // order-steps
  items?: OrderItem[];
  correctOrder?: string[];
  // prompt-builder
  slots?: PromptSlot[];
  suggestions?: PromptSuggestion[];
  correctAssignments?: Record<string, string>;
}

export type Block =
  | { type: 'text'; md: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'image'; url: string; alt: string }
  | { type: 'exercise'; config: ExerciseConfig };

export interface Article {
  slug: string;
  courseSlug: string;
  title: string;
  summary?: string;
  testId: string;
  blocks: Block[];
}

export interface Test {
  id: string;
  title: string;
  courseSlug: string;
  exercises: ExerciseConfig[];
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface ExerciseResult {
  exerciseId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  partial: boolean;
}

export type ExerciseMode = 'inline' | 'test';
