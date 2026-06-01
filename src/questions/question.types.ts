export type DIFFICULTY_LEVEL = 'easy' | 'medium' | 'hard';

export interface testCase {
  hidden: boolean;
  input: any[];
  output: any;
  // marks auto generated cases so frontend can display them differently
  // 'manual'  - admin created this test case
  // 'edge'    - auto generated edge case (empty array, negatives etc.)
  // 'stress'  - auto generated stress test (large input for TLE detection)
  type?: 'manual' | 'edge' | 'stress';
}

// each input parameter gets its own constraints based on its type.
// only relevant fields are used per type — rest are ignored.
//
// array_int / array_char   - minSize, maxSize, minValue, maxValue
// 2d_array_int             - minRows, maxRows, minCols, maxCols, minValue, maxValue
// 2d_array_char            - minRows, maxRows, minCols, maxCols
// int / float              - minValue, maxValue
// string                   - minLength, maxLength
// boolean                  - no constraints needed (only true/false)

export interface InputConstraints {
  // for arrays (1D and 2D)
  minSize?: number;       // min array length (1D)
  maxSize?: number;       // max array length (1D)
  minRows?: number;       // min rows (2D)
  maxRows?: number;       // max rows (2D)
  minCols?: number;       // min columns (2D)
  maxCols?: number;       // max columns (2D)

  // for numeric types (int, float, array_int, 2d_array_int)
  minValue?: number;
  maxValue?: number;

  // for string type
  minLength?: number;
  maxLength?: number;
}


export interface InputTypeWithConstraints {
  type: string;           // array_int, int, string, boolean etc.
  paramName: string;      // variable name used in solution template
  constraints?: InputConstraints;
}

// these apply to the whole question — not per parameter
export interface QuestionConstraints {
  // how many seconds candidate's code is allowed to run
  // default recommendations:
  //   easy   - 1-2 seconds
  //   medium - 2-3 seconds
  //   hard   - 3-5 seconds
  timeLimit: number;

  // how much memory (in MB) candidate's code is allowed to use
  // default: 256MB is standard for most DSA problems
  memoryLimit: number;
}

// questions are no longer instantly published on creation.
// admin must verify with a reference solution before publishing.
//
// draft      - created but not yet verified/published
// published  - reference solution verified, available for tests
// archived   - previously published, now hidden
export type QUESTION_STATUS = 'draft' | 'published' | 'archived';