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
import java.util.stream.*;
EXTRA_IMPORTS
public class Main{
  SOLUTION_METHOD
  public static void main (String args[]){
    INVOCATION
  }
}`;

export const TEST_CODE_FOR_GO = `package main

import (
	"fmt"
	"time"
)

SOLUTION_METHOD
func main() {
  INVOCATION
}
`;

export const TEST_CODE_FOR_CSHARP = `using System;
using System.Linq;
using System.Diagnostics;

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
  //Function will be executed with inputs from test cases on run test cases
  return null as any;
}`;

export enum TEST_LANGUAGES {
  PYTHON = 'python',
  CPP = 'cpp',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  GO = 'go',
  CSHARP = 'csharp',
  TYPESCRIPT = 'typescript',
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
  python:     71,  // Python (3.8.1)
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  cpp:        54,  // C++ (GCC 9.2.0)
  java:       62,  // Java (OpenJDK 13.0.1)
  go:         60,  // Go (1.13.5)
  csharp:     51,  // C# (Mono 6.6.0.161)
  typescript: 74,  // TypeScript (3.7.4)
};

// judge0 status iDs // 1 = In Queue, 2 = Processing, 3 = Accepted, others = errors
export const JUDGE0_IN_PROGRESS_STATUSES = new Set([1, 2]);


// how long to wait between polling Judge0 for results (ms)
export const POLL_INTERVAL_MS = 1000;
// maximum number of polling attempts before giving up
export const MAX_POLL_ATTEMPTS = 15;