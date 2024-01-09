export const TEST_CODE_FOR_PYTHON = `SOLUTION_METHOD
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

export const TEST_CODE_FOR_JAVA = `import java.util.Arrays;
class Solution{
  SOLUTION_METHOD
  public static void main (String args[]){
    INVOCATION
  }
}`;

export const TEST_CODE_FOR_GO = `package main

import "fmt"

SOLUTION_METHOD
func main() {
  INVOCATION
}
`;

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

export enum TEST_LANGUAGES {
  PYTHON = 'python',
  CPP = 'cpp',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  GO = 'go',
}

export interface QUESTION_INPUT_TYPE {
  type: string;
  paramName: string;
}

export enum QUESTION_OUTPUT_TYPE {
  INT = 'int',
  ARRAY_INT = 'array_int',
  ARRAY_CHAR = 'array_char',
  BOOLEAN = 'boolean',
  STRING = 'string',
  FLOAT = 'float',
}
