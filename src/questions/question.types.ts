export enum DIFFICULTY_LEVEL {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface testCase {
  hidden: boolean;
  input: any[];
  output: any[];
}
