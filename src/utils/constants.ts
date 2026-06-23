export const TEST_CODE_FOR_PYTHON = `import time
SOLUTION_METHOD
if __name__ == '__main__':
  INVOCATION`;

export const TEST_CODE_FOR_CPP = `#include<bits/stdc++.h>

using namespace std;

SOLUTION_METHOD

int main() {

  INVOCATION

	return 0;
}`;

export const TEST_CODE_FOR_JS = `SOLUTION_METHOD
function main(){
  INVOCATION
}
main()`;

export const TEST_CODE_FOR_JAVA = `import java.util.*;
public class Main{
  SOLUTION_METHOD
  public static void main (String args[]){
    INVOCATION
  }
}`;

export const TEST_CODE_FOR_GO = `package main

import (
	"fmt"
  "strings"
)

SOLUTION_METHOD
func main() {
  INVOCATION
}
`;

export const TEST_CODE_FOR_CSHARP = `using System;
using System.Linq;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text;

class Program {
  SOLUTION_METHOD
  static void Main(string[] args) {
    INVOCATION
  }
}`;

export const TEST_CODE_FOR_TYPESCRIPT = `SOLUTION_METHOD
function main() {
  INVOCATION
}
main();`;

export const TEST_CODE_FOR_RUST = `
use std::collections::*;
SOLUTION_METHOD
fn main() {
    INVOCATION
}`;

export const TEST_CODE_FOR_SWIFT = `SOLUTION_METHOD
INVOCATION`;

export const TEST_CODE_FOR_PHP = `<?php
SOLUTION_METHOD
INVOCATION
?>`;

export const TEST_CODE_FOR_RUBY = `SOLUTION_METHOD
INVOCATION`;

export const TEST_CODE_FOR_KOTLIN = `import java.util.*
SOLUTION_METHOD
fun main(args: Array<String>) {
    INVOCATION
}`;

export const CPP_SOLUTION_TEMPLATE = `return_type solution(parameters){
  //Write your code only in provided function
  //Dont write any of your code outside this function
  //Function will be executed with inputs from test cases on run test cases\n
}`;

export const JAVA_SOLUTION_TEMPLATE = `public static return_type solution(parameters){
  //Write your code only in provided function
  //Dont write any of your code outside this function
  //Function will be executed with inputs from test cases on run test cases
}`;

export const PYTHON_SOLUTION_TEMPLATE = `def solution(parameters):
  #Write your code only in provided function
  #Dont write any of your code outside this function
  #Function will be executed with inputs from test cases on run test cases\n
`;

export const JAVASCRIPT_SOLUTION_TEMPLATE = `function solution(parameters){
  //Write your code only in provided function
  //Dont write any of your code outside this function
  //Function will be executed with inputs from test cases on run test cases\n
}`;

export const GO_SOLUTION_TEMPLATE = `
func solution(parameters) return_type {
	// Write your code only in the provided function
	// Don't write any of your code outside this function
	// Function will be executed with inputs from test cases on run test cases
}`;

export const CSHARP_SOLUTION_TEMPLATE = `public static return_type solution(parameters){
  //Write your code only in provided function
  //Dont write any of your code outside this function
  //Function will be executed with inputs from test cases on run test cases
}`;

export const TYPESCRIPT_SOLUTION_TEMPLATE = `function solution(parameters): return_type {
  //Write your code only in provided function
  //Dont write any of your code outside this function

}`;

export enum QUESTION_TYPE {
  DSA = 'dsa',
  DATABASE = 'database',
}

export enum TEST_LANGUAGES {
  PYTHON = 'python',
  CPP = 'cpp',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  GO = 'go',
  CSHARP = 'csharp',
  TYPESCRIPT = 'typescript',
  C = 'c',
  RUST = 'rust',
  RUBY = 'ruby',
  PHP = 'php',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  SQL = 'sql',
}

export interface QUESTION_INPUT_TYPE {
  type: string;
  paramName: string;
  constraints?: any;
}

export interface QUESTION_CONSTRAINTS {
  timeLimit?: number; // in seconds
  memoryLimit?: number; // in MB
}

export interface OUTPUT_CONSTRAINTS {
  isOrdered?: boolean;
  tolerance?: number;
  caseSensitive?: boolean;
}

export enum QUESTION_OUTPUT_TYPE {
  INT = 'int',
  ARRAY_INT = 'array_int',
  ARRAY_CHAR = 'array_char',
  BOOLEAN = 'boolean',
  STRING = 'string',
  FLOAT = 'float',
}

export enum PAYMENT_TYPES {
  ADD_ON = 'add-on',
  SUBSCRIPTION = 'subscription',
}

// judge0 Language IDs 
// Map internal language names to Judge0 language IDs.
// full list: https://ce.judge0.com (GET /languages)
export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71, // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  go: 60, // Go (1.13.5)
  csharp: 51, // C# (Mono 6.6.0.161)
  typescript: 74, // TypeScript (3.7.4)
  c: 50, // C (GCC 9.2.0)
  rust: 73, // Rust (1.40.0)
  ruby: 72, // Ruby (2.7.0)
  php: 68, // PHP (7.4.1)
  swift: 83, // Swift (5.2.3)
  kotlin: 78, // Kotlin (1.3.70)
  sql: 82, // SQL (SQLite 3.27.2)
  'C (GCC 7.4.0)': 48,
  'C (GCC 9.2.0)': 50,
  'C++ (GCC 7.4.0)': 52,
  'C++ (GCC 9.2.0)': 54,
  'Java (OpenJDK 13.0.1)': 62,
  'JavaScript (Node.js 12.14.0)': 63,
  'Python (3.8.1)': 71,
  'TypeScript (3.7.4)': 74,
  'Go (1.13.5)': 60,
  'C# (Mono 6.6.0.161)': 51,
  'Kotlin (1.3.70)': 78,
  'Ruby (2.7.0)': 72,
  'Swift (5.2.3)': 83,
  'Rust (1.40.0)': 73,
  'Dart (2.19.2)': 90,
  'Scala (2.13.2)': 81,
  'D (DMD 2.089.1)': 56,
  'Elixir (1.9.4)': 57,
  'Erlang (OTP 22.2)': 58,
  'F# (.NET Core SDK 3.1.202)': 87,
  'Haskell (GHC 8.8.1)': 61,
  'Clojure (1.10.1)': 86,
  'Groovy (3.0.3)': 88,
  'OCaml (4.09.0)': 65,
  'Pascal (FPC 3.0.4)': 67,
  'Objective-C (Clang 7.0.1)': 79,
  'Basic (FBC 1.07.1)': 47,
  'Fortran (GFortran 9.2.0)': 59,
  'SQL (SQLite 3.27.2)': 82,
  'Bash (5.0.0)': 46,
  'Perl (5.28.1)': 85,
  'Lua (5.3.5)': 64,
  'PHP (7.4.1)': 68,
  'R (4.0.0)': 80,
  'Octave (5.1.0)': 66,
  'Prolog (GNU Prolog 1.4.5)': 69,
  'Plain Text': 43,
  'Executable': 44,
  'Multi-file program': 89,
  'Assembly (NASM 2.14.02)': 45,
  'COBOL (GnuCOBOL 2.2)': 77,
  'Visual Basic.Net (vbnc 0.0.0.5943)': 84,
  'JavaFX (JDK 17.0.6, OpenJFX 22.0.2)': 96,
};

// Complete mapping of all Judge0 languages by category
export const LANGUAGE_CATEGORIES = {
  // [QUESTION_TYPE.DSA]: [
  //   { id: 48, name: 'C (GCC 7.4.0)', internal: 'c' },
  //   { id: 50, name: 'C (GCC 9.2.0)', internal: 'c' },
  //   { id: 52, name: 'C++ (GCC 7.4.0)', internal: 'cpp' },
  //   { id: 54, name: 'C++ (GCC 9.2.0)', internal: 'cpp' },
  //   { id: 62, name: 'Java (OpenJDK 13.0.1)', internal: 'java' },
  //   { id: 63, name: 'JavaScript (Node.js 12.14.0)', internal: 'javascript' },
  //   { id: 71, name: 'Python (3.8.1)', internal: 'python' },
  //   { id: 74, name: 'TypeScript (3.7.4)', internal: 'typescript' },
  //   { id: 60, name: 'Go (1.13.5)', internal: 'go' },
  //   { id: 51, name: 'C# (Mono 6.6.0.161)', internal: 'csharp' },
  //   { id: 78, name: 'Kotlin (1.3.70)', internal: 'kotlin' },
  //   { id: 72, name: 'Ruby (2.7.0)', internal: 'ruby' },
  //   { id: 83, name: 'Swift (5.2.3)', internal: 'swift' },
  //   { id: 73, name: 'Rust (1.40.0)', internal: 'rust' },
  //   { id: 90, name: 'Dart (2.19.2)', internal: 'dart' },
  //   { id: 81, name: 'Scala (2.13.2)', internal: 'scala' },
  //   { id: 56, name: 'D (DMD 2.089.1)', internal: 'd' },
  //   { id: 57, name: 'Elixir (1.9.4)', internal: 'elixir' },
  //   { id: 58, name: 'Erlang (OTP 22.2)', internal: 'erlang' },
  //   { id: 87, name: 'F# (.NET Core SDK 3.1.202)', internal: 'fsharp' },
  //   { id: 61, name: 'Haskell (GHC 8.8.1)', internal: 'haskell' },
  //   { id: 86, name: 'Clojure (1.10.1)', internal: 'clojure' },
  //   { id: 88, name: 'Groovy (3.0.3)', internal: 'groovy' },
  //   { id: 65, name: 'OCaml (4.09.0)', internal: 'ocaml' },
  //   { id: 67, name: 'Pascal (FPC 3.0.4)', internal: 'pascal' },
  //   { id: 79, name: 'Objective-C (Clang 7.0.1)', internal: 'objective-c' },
  //   { id: 47, name: 'Basic (FBC 1.07.1)', internal: 'basic' },
  //   { id: 59, name: 'Fortran (GFortran 9.2.0)', internal: 'fortran' },
  // ],
    [QUESTION_TYPE.DSA]: [
    { id: 52, name: 'C++ (GCC 7.4.0)', internal: 'cpp' },
    { id: 54, name: 'C++ (GCC 9.2.0)', internal: 'cpp' },
    { id: 62, name: 'Java (OpenJDK 13.0.1)', internal: 'java' },
    { id: 63, name: 'JavaScript (Node.js 12.14.0)', internal: 'javascript' },
    { id: 71, name: 'Python (3.8.1)', internal: 'python' },
    { id: 74, name: 'TypeScript (3.7.4)', internal: 'typescript' },
    { id: 60, name: 'Go (1.13.5)', internal: 'go' },
    { id: 51, name: 'C# (Mono 6.6.0.161)', internal: 'csharp' },
    { id: 73, name: 'Rust (1.40.0)', internal: 'rust' },
  ],
  [QUESTION_TYPE.DATABASE]: [
    { id: 82, name: 'SQL (SQLite 3.27.2)', internal: 'sql' },
  ],
  'scripting': [
    { id: 46, name: 'Bash (5.0.0)', internal: 'bash' },
    { id: 85, name: 'Perl (5.28.1)', internal: 'perl' },
    { id: 64, name: 'Lua (5.3.5)', internal: 'lua' },
    { id: 68, name: 'PHP (7.4.1)', internal: 'php' },
    { id: 80, name: 'R (4.0.0)', internal: 'r' },
    { id: 66, name: 'Octave (5.1.0)', internal: 'octave' },
    { id: 69, name: 'Prolog (GNU Prolog 1.4.5)', internal: 'prolog' },
  ],
  'utility': [
    { id: 43, name: 'Plain Text', internal: 'plaintext' },
    { id: 44, name: 'Executable', internal: 'executable' },
    { id: 89, name: 'Multi-file program', internal: 'multifile' },
    { id: 45, name: 'Assembly (NASM 2.14.02)', internal: 'assembly' },
    { id: 77, name: 'COBOL (GnuCOBOL 2.2)', internal: 'cobol' },
    { id: 84, name: 'Visual Basic.Net (vbnc 0.0.0.5943)', internal: 'vbnet' },
    { id: 96, name: 'JavaFX (JDK 17.0.6, OpenJFX 22.0.2)', internal: 'javafx' },
  ]
};

// judge0 status iDs // 1 = In Queue, 2 = Processing, 3 = Accepted, others = errors
export const JUDGE0_IN_PROGRESS_STATUSES = new Set([1, 2]);


// how long to wait between polling Judge0 for results (ms)
export const POLL_INTERVAL_MS = 1000;
// maximum number of polling attempts before giving up
export const MAX_POLL_ATTEMPTS = 15;