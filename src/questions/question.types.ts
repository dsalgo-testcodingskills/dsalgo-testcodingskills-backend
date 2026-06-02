export type DIFFICULTY_LEVEL = 'easy' | 'medium' | 'hard';
export type QUESTION_STATUS = 'draft' | 'published' | 'archived';
export interface testCase {
  input: any[];
  output: any;
  hidden: boolean;

}

// preset  -> admin picks from friendly presets (non technical friendly)
// custom  -> admin provides a regex pattern (developer friendly)
export type ALLOWED_CHARS_PRESET =
  | 'lowercase'      // a-z only
  | 'uppercase'      // A-Z only
  | 'digits'         // 0-9 only
  | 'alphanumeric'   // a-z, A-Z, 0-9
  | 'lowercase_digits' // a-z, 0-9
  | 'spaces'         // includes spaces
  | 'all';           // any character

export interface AllowedCharsConstraint {
  preset?: ALLOWED_CHARS_PRESET;
  customRegex?: string; // e.g. "^[a-z0-9_]+$"
}

export interface ArrayIntConstraints {
  minSize?: number;         // min array length (default: 1)
  maxSize?: number;         // max array length
  canBeEmpty?: boolean;     // can length be 0? overrides minSize if true

  minElement?: number;      // min value of each arr[i]
  maxElement?: number;      // max value of each arr[i]

  isSorted?: boolean;       // array is always sorted
  sortOrder?: 'asc' | 'desc'; // if isSorted, which order
  isUnique?: boolean;       // no duplicate elements
  isPositiveOnly?: boolean; // all elements > 0
  isNonNegative?: boolean;  // all elements >= 0
}

export interface ArrayCharConstraints {
  minSize?: number;
  maxSize?: number;
  canBeEmpty?: boolean;

  allowedChars?: AllowedCharsConstraint;

  isUnique?: boolean;       // no duplicate chars
}

export interface TwoDArrayIntConstraints {
  minRows?: number;
  maxRows?: number;
  minCols?: number;
  maxCols?: number;
  canBeEmpty?: boolean;

  minElement?: number;
  maxElement?: number;

  isSquare?: boolean;       // rows always equal cols (graph/matrix problems)
  isSorted?: boolean;       // each row is sorted
  isSymmetric?: boolean;    // matrix[i][j] === matrix[j][i]
  isPositiveOnly?: boolean;
  isNonNegative?: boolean;
}

export interface TwoDArrayCharConstraints {
  minRows?: number;
  maxRows?: number;
  minCols?: number;
  maxCols?: number;
  canBeEmpty?: boolean;

  allowedChars?: AllowedCharsConstraint;

  isSquare?: boolean;
}

export interface IntConstraints {
  minValue?: number;
  maxValue?: number;

  isPositiveOnly?: boolean; // always > 0
  isNonNegative?: boolean;  // always >= 0
  isNonZero?: boolean;      // never 0
}

export interface FloatConstraints {
  minValue?: number;
  maxValue?: number;

  decimalPrecision?: number; // max decimal places e.g. 2 means 0.01,10.25 precision

  isPositiveOnly?: boolean;
  isNonNegative?: boolean;
  isNonZero?: boolean;
}

export interface StringConstraints {
  minLength?: number;
  maxLength?: number;
  canBeEmpty?: boolean;

  allowedChars?: AllowedCharsConstraint;

  isPalindrome?: boolean;   // always a palindrome
  isUnique?: boolean;       // all chars distinct
  hasSpaces?: boolean;      // can contain spaces
  caseSensitive?: boolean;  // comparison is case sensitive (default: true)
}

// no constraints needed for boolean — only true/false
export interface BooleanConstraints {}

// one type that covers all possible input constraints.
// backend picks which fields are relevant based on the input type.
export type InputConstraints =
  | ArrayIntConstraints
  | ArrayCharConstraints
  | TwoDArrayIntConstraints
  | TwoDArrayCharConstraints
  | IntConstraints
  | FloatConstraints
  | StringConstraints
  | BooleanConstraints;

// controls how output comparison works during test case evaluation.
export interface OutputConstraints {
  // for array outputs: does order matter?
  // [0,1] and [1,0] are both valid for Two Sum -> isOrdered: false
  // Leetcode handles this by sorting both before comparing
  isOrdered?: boolean;        // default: true (order matters)

  // for float outputs: acceptable tolerance
  // e.g. tolerance: 0.001 means |actual - expected| <= 0.001 is accepted
  // Standard in competitive programming
  tolerance?: number;         // default: 0 (exact match)

  // for string outputs: case sensitive comparison?
  caseSensitive?: boolean;    // default: true
}

export interface InputTypeWithConstraints {
  type: string;
  paramName: string;
  constraints?: InputConstraints;
}

export interface QuestionConstraints {
  timeLimit: number;    // seconds — for Judge0
  memoryLimit: number;  // MB — for Judge0
}