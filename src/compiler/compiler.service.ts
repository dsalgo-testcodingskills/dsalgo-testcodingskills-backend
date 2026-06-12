import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { ConnectionStates, Model } from 'mongoose';
import * as path from 'path';
import { QuestionsService } from 'src/questions/question.service';
import { QuestionDocument } from '../questions/SCHEMA/question.schema';
import { exec } from 'child_process';
import {
  TEST_CODE_FOR_CPP,
  TEST_CODE_FOR_GO,
  TEST_CODE_FOR_JAVA,
  TEST_CODE_FOR_JS,
  TEST_CODE_FOR_PYTHON,
  TEST_CODE_FOR_CSHARP,
  TEST_CODE_FOR_TYPESCRIPT,
  TEST_LANGUAGES,
  JUDGE0_LANGUAGE_IDS,
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  JUDGE0_IN_PROGRESS_STATUSES,
} from '../utils/constants';
import { getDatatypeOfParamters } from '../common/common.functions';

@Injectable()
export class CompilerService {
  constructor(
    @InjectModel('questions')
    private readonly questionModel: Model<QuestionDocument>,
    private readonly questionsService: QuestionsService,
  ) {}

  getQuestions() {
    return this.questionsService.getQuestions();
  }

  getQuestion(questionId) {
    return this.questionModel.findById(questionId);
  }

  //Returns the arguments for a function to be inserted in the template.
  async getFunctionArguments(language, inputType, testCaseInput) {
    let functionArguments = '';
    for (let i = 0; i < inputType.length; i++) {
      if (language === 'cpp') {
        functionArguments +=
          inputType[i].type === '2d_array_int'
            ? `vector<vector<int>>{${testCaseInput[0]
                .map((subArr) => `{${subArr.join(',')}}`)
                .join(',')}}`
            : inputType[i].type === '2d_array_char'
            ? `vector<vector<char>>{${testCaseInput[0]
                .map(
                  (subArr) =>
                    `{${JSON.stringify(subArr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`,
                )
                .join(',')}}`
            : inputType[i].type === 'array_int'
            ? `vector<int>{${testCaseInput[i].join(',')}}`
            : inputType[i].type === 'array_char'
            ? `vector<char>{${JSON.stringify(testCaseInput[i])
                .replace(/^\[|\]$/g, '')
                .replace(/"/g, "'")}}`
            : `${JSON.stringify(testCaseInput[i])},`;
      } else if (language === 'java') {
        functionArguments +=
          inputType[i].type === '2d_array_int'
            ? `new int[][] {${testCaseInput[i]
                .map((arr) => `{${arr.join(',')}}`)
                .join(',')}},`
            : inputType[i].type === '2d_array_char'
            ? `new char[][] {${testCaseInput[i]
                .map(
                  (arr) =>
                    `new char[] {${JSON.stringify(arr)
                      .replace(/^\[|\]$/g, '')
                      .replace(/"/g, "'")}}`,
                )
                .join(',')}},`
            : inputType[i].type === 'array_int'
            ? `new int[] {${testCaseInput[i].join(',')}},`
            : inputType[i].type === 'array_char'
            ? `new char[] {${JSON.stringify(testCaseInput[i])
                .replace(/^\[|\]$/g, '')
                .replace(/"/g, "'")}},`
            : `${JSON.stringify(testCaseInput[i])},`;
      } else if (language === 'python') {
        functionArguments +=
          inputType[i].type === 'boolean'
            ? JSON.stringify(testCaseInput[i]).charAt(0).toUpperCase() +
              JSON.stringify(testCaseInput[i]).slice(1)
            : inputType[i].type.includes('2d_array')
            ? JSON.stringify(testCaseInput[i]).replace(/\],\[/g, '],\n[') + ','
            : JSON.stringify(testCaseInput[i]) + ',';
      } else if (language === 'javascript') {
        functionArguments += JSON.stringify(testCaseInput[i]) + ',';
      } else if (language === 'go') {
        functionArguments +=
          inputType[i].type === '2d_array_int'
            ? `[][]int{${testCaseInput[i]
                .map((row) => `{${row.join(',')}}`)
                .join(',')}}, `
            : inputType[i].type === '2d_array_char'
            ? `[][]rune{${testCaseInput[i]
                .map(
                  (row) =>
                    `[]rune{${JSON.stringify(row)
                      .replace(/^\[|\]$/g, '')
                      .replace(/"/g, "'")}}`,
                )
                .join(',')}}, `
            : inputType[i].type === 'array_int'
            ? `[]int{${testCaseInput[i].join(',')}}, `
            : inputType[i].type === 'array_char'
            ? `[]rune{${JSON.stringify(testCaseInput[i])
                .replace(/^\[|\]$/g, '')
                .replace(/"/g, "'")}}, `
            : `${JSON.stringify(testCaseInput[i])}, `;
      } else if (language === 'csharp') {
        functionArguments +=
          inputType[i].type === '2d_array_int'
            ? `new int[][] {${testCaseInput[i]
                .map((arr) => `new int[] {${arr.join(',')}}`)
                .join(',')}},`
            : inputType[i].type === '2d_array_char'
            ? `new char[][] {${testCaseInput[i]
                .map(
                  (arr) =>
                    `new char[] {${JSON.stringify(arr)
                      .replace(/^\[|\]$/g, '')
                      .replace(/"/g, "'")}}`,
                )
                .join(',')}},`
            : inputType[i].type === 'array_int'
            ? `new int[] {${testCaseInput[i].join(',')}},`
            : inputType[i].type === 'array_char'
            ? `new char[] {${JSON.stringify(testCaseInput[i])
                .replace(/^\[|\]$/g, '')
                .replace(/"/g, "'")}},`
            : `${JSON.stringify(testCaseInput[i])},`;
      } else if (language === 'typescript') {
        functionArguments += JSON.stringify(testCaseInput[i]) + ',';
      }
    }
    return functionArguments.replace(/,$/g, '');
  }

  async getInvocationCode(language, question, testCaseIndex) {
    let functionCall = `solution(${await this.getFunctionArguments(
      language,
      question.inputType,
      question.testCases[testCaseIndex].input,
    )})`;
    if (language === 'cpp') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall}; cout<<"<logsOutputSeprator>";for(int i=0;i<${
          question.testCases[testCaseIndex].output.length
        };i++)cout<<arr[i]<<" ";`;
      } else {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall}; cout<<"<logsOutputSeprator>"<<value;`;
      }
    } else if (language === 'java') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall}; System.out.print("<logsOutputSeprator>");for(int i=0;i<arr.length;i++)System.out.print(arr[i]+" ");`;
      } else {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall}; System.out.print("<logsOutputSeprator>"+value);`;
      }
    } else if (language === 'python') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `arr=${functionCall};\nprint("<logsOutputSeprator>",end='');\nfor el in arr:\n\tprint(el,end=' ');`;
      } else {
        return `value=${functionCall};\nprint("<logsOutputSeprator>",value,end='',sep='');`;
      }
    } else if (language === 'javascript') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `arr = ${functionCall}; if(arr) console.log("<logsOutputSeprator>",...arr);else console.log("<logsOutputSeprator>",arr);`;
      } else {
        return `value = ${functionCall}; console.log("<logsOutputSeprator>",value);`;
      }
    } else if (language === 'go') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `arr := ${functionCall}; fmt.Print("<logsOutputSeprator>"); for i := 0; i < len(arr); i++ { fmt.Print(arr[i], " ") }`;
      } else {
        return `value := ${functionCall}; fmt.Printf("<logsOutputSeprator>%v\\n", value)`;
      }
    } else if (language === 'csharp') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall}; Console.Write("<logsOutputSeprator>");for(int i=0;i<arr.Length;i++)Console.Write(arr[i]+" ");`;
      } else {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall}; Console.Write("<logsOutputSeprator>"+value);`;
      }
    } else if (language === 'typescript') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `let arr = ${functionCall}; if(arr) console.log("<logsOutputSeprator>",...arr);else console.log("<logsOutputSeprator>",arr);`;
      } else {
        return `let value = ${functionCall}; console.log("<logsOutputSeprator>",value);`;
      }
    }
  }

  async getConvertedOutput(userOutput, outputType, language) {
    try {
      let convertedOutput;
      if (
        userOutput &&
        (outputType === 'array_char' || outputType === 'array_int')
      ) {
        convertedOutput = userOutput.split(' ');
        convertedOutput =
          outputType === 'array_int'
            ? await convertedOutput.map(Number)
            : convertedOutput;
      } else if (
        userOutput &&
        (outputType === 'int' || outputType === 'boolean')
      ) {
        if ((language === 'cpp' || language === 'csharp') && outputType === 'boolean')
          userOutput =
            userOutput === '1' ? true : userOutput === '0' ? false : userOutput === 'True' ? true : userOutput === 'False' ? false : userOutput;
        else if (language === 'python' && outputType === 'boolean')
          userOutput =
            userOutput === 'True'
              ? true
              : userOutput === 'False'
              ? false
              : userOutput;
        convertedOutput = JSON.parse(userOutput);
      } else if (outputType === 'string') {
        convertedOutput = userOutput;
      } else convertedOutput = null;
      return convertedOutput;
    } catch (error) {
      return null;
    }
  }

  async executeCode(executeCommand, question, testCaseIndex, language) {
    return new Promise((resolve, reject) => {
      exec(executeCommand, { timeout: 10000 }, async (error, stdout, stderr) => {
        if (stdout) {
          const [userLogs, userOutput] = stdout.split('<logsOutputSeprator>');
          let convertedOutput = await this.getConvertedOutput(
            userOutput ? userOutput.trim() : '',
            question.outputType,
            language,
          );
          if (
            JSON.stringify(convertedOutput) ===
            JSON.stringify(question.testCases[testCaseIndex].output)
          ) {
            resolve({
              result: true,
              logs: userLogs,
              hidden: question.testCases[testCaseIndex].hidden,
              actualOutput: userOutput ? userOutput.trim() : '',
            });
          } else
            resolve({
              result: false,
              logs: userLogs,
              hidden: question.testCases[testCaseIndex].hidden,
              actualOutput: userOutput ? userOutput.trim() : '',
            });
        } else if (stderr && stderr.length > 0) {
          let msg = 'Command failed: ';
          msg =
            language === 'go'
              ? msg + 'go\n'
              : language === 'python'
              ? msg + 'python3\n'
              : language === 'javascript'
              ? msg + 'node\n'
              : language === 'java'
              ? msg + 'javac\n'
              : language === 'cpp'
              ? msg + 'g++\n'
              : language === 'csharp'
              ? msg + 'mcs\n'
              : language === 'typescript'
              ? msg + 'tsc\n'
              : '';
          resolve({
            result: false,
            logs: msg + stderr,
            hidden: question.testCases[testCaseIndex].hidden,
            actualOutput: '',
          });
        } else if (error) {
          reject({
            result: false,
            logs: 'Code execution failed due to some error on server',
            hidden: question.testCases[testCaseIndex].hidden,
            actualOutput: '',
          });
        } else {
          resolve({
            result: false,
            logs: 'Code execution produced no output.',
            hidden: question.testCases[testCaseIndex].hidden,
            actualOutput: '',
          });
        }
      });
    });
  }

  async writeToFile(fileName, sourceCode) {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, sourceCode, (err) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  //Compile and run all test cases for a question against the user code and return the result.
  async compileAndRun(
    language: TEST_LANGUAGES,
    code: string,
    question,
  ) {
    try {
    const solution_code =
        language === 'go'
          ? TEST_CODE_FOR_GO.replace('SOLUTION_METHOD', code)
          : language === 'cpp'
          ? TEST_CODE_FOR_CPP.replace('SOLUTION_METHOD', code)
          : language === 'java'
          ? TEST_CODE_FOR_JAVA.replace('SOLUTION_METHOD', code)
          : language === 'python'
          ? TEST_CODE_FOR_PYTHON.replace('SOLUTION_METHOD', code)
          : language === 'javascript'
          ? TEST_CODE_FOR_JS.replace('SOLUTION_METHOD', code)
          : language === 'csharp'
          ? TEST_CODE_FOR_CSHARP.replace('SOLUTION_METHOD', code)
          : language === 'typescript'
          ? TEST_CODE_FOR_TYPESCRIPT.replace('SOLUTION_METHOD', code)
          : '';
       if (!solution_code) throw new Error(`Unsupported language: ${language}`);
       const languageId=JUDGE0_LANGUAGE_IDS[language]
       if (!languageId) throw new Error(`No Judge0 language ID found for: ${language}`);
      const submissions = await Promise.all(
        question.testCases.map(async (_, i) => {
          const invocationCode = await this.getInvocationCode(language, question, i);
          const sourceCode = solution_code.replace('INVOCATION', invocationCode);
          return { source_code: sourceCode, language_id: languageId };
        }),
      );
      const timeLimit   = Math.min(question.constraints?.timeLimit ?? 2, 15.0);
      const memoryLimit = question.constraints?.memoryLimit ?? 256;
      const tokens = await this.submitBatchToJudge0(submissions, timeLimit, memoryLimit);
      console.log("🚀 ~ CompilerService ~ compileAndRun ~ tokens:", tokens)
      const judge0Results = await this.pollBatchResults(tokens);

      const testCaseResults = await Promise.all(
        judge0Results.map((result, i) =>
          this.processJudge0Result(result, question, i, language),
        ),
      );
     
      return testCaseResults;
    } catch (error) {
      return error.message;
    }
  }

  private async submitBatchToJudge0(
    submissions: { source_code: string; language_id: number }[],
    timeLimit: number = 2,
    memoryLimit: number = 256,
  ) {
    const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submissions: submissions.map((s) => ({
          ...s,
          cpu_time_limit: timeLimit,            // from question.constraints.timeLimit has to implement in frontend
          memory_limit: memoryLimit * 1024,     // MB -> KB (Judge0 expects KB)
          enable_network: false,                
        })),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(`Judge0 batch submission failed: ${response.statusText} - ${JSON.stringify(errorBody)}`);
    }

    // returns array of { token } objects, one per submission
    const tokens: { token: string }[] = await response.json();
    return tokens.map((t) => t.token);
  }



  // poll Judge0 until all test cases are done 
  // Judge0 processes submissions asynchronously. We poll every second
  // until all results are ready or we hit the timeout.
  private async pollBatchResults(tokens: string[]) {
    const tokenList = tokens.join(',');

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));

      const response = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenList}&base64_encoded=false&fields=token,stdout,stderr,compile_output,status,time,memory`,
        
      );

      if (!response.ok) {
        throw new Error(`Judge0 polling failed: ${response.statusText}`);
      }

      const data = await response.json();
      const submissions = data.submissions;

      // Check if all submissions are done (no longer in queue or processing)
      const allDone = submissions.every(
        (s) => !JUDGE0_IN_PROGRESS_STATUSES.has(s.status?.id),
      );

      if (allDone) return submissions;
    }

    throw new Error('Judge0 timed out waiting for results');
  }

  // process a single Judge0 result into our response format 
  private async processJudge0Result(judge0Result, question, testCaseIndex, language) {
    const status = judge0Result.status?.id;

    //compilation error
    if (status === 6) {
      return {
        result: false,
        logs: judge0Result.compile_output || 'Compilation error',
        hidden: question.testCases[testCaseIndex].hidden,
        actualOutput: '',
        time: judge0Result.time,
        memory: judge0Result.memory,
      };
    }

    // time limit exceeded
    if (status === 5) {
      return {
        result: false,
        logs: 'Time Limit Exceeded',
        hidden: question.testCases[testCaseIndex].hidden,
        actualOutput: '',
        time: judge0Result.time,
        memory: judge0Result.memory,
      };
    }

    // runtime error, memory limit exceeded etc.
    if (status >= 7) {
      return {
        result: false,
        logs: judge0Result.stderr || judge0Result.status?.description || 'Runtime error',
        hidden: question.testCases[testCaseIndex].hidden,
        actualOutput: '',
        time: judge0Result.time,
        memory: judge0Result.memory,
      };
    }

    // accepted — compare output
    const stdout = judge0Result.stdout || '';
    const [userLogs, userOutput] = stdout.split('<logsOutputSeprator>');

    const convertedOutput = await this.getConvertedOutput(
      userOutput ? userOutput.trim() : '',
      question.outputType,
      language,
    );

    // use compareOutputs with outputConstraints instead of simple JSON.stringify
    // this handles: isOrdered, tolerance, caseSensitive
    const isCorrect = this.compareOutputs(
      convertedOutput,
      question.testCases[testCaseIndex].output,
      question.outputType,
      question.outputConstraints,
    );

    return {
      result: isCorrect,
      logs: userLogs || '',
      hidden: question.testCases[testCaseIndex].hidden,
      actualOutput: userOutput ? userOutput.trim() : '',
      time: judge0Result.time,
      memory: judge0Result.memory,
    };
  }
 // Handles:
  //   isOrdered: false  -> sort both arrays before comparing (Two Sum etc.)
  //   tolerance         -> float comparison with tolerance e.g. ±0.001
  //   caseSensitive     -> string comparison case sensitivity
  private compareOutputs(
    actual: any,
    expected: any,
    outputType: string,
    outputConstraints: any, // has to implement in frontend
  ): boolean {
    const isOrdered     = outputConstraints?.isOrdered     ?? true;
    const tolerance     = outputConstraints?.tolerance     ?? 0;
    const caseSensitive = outputConstraints?.caseSensitive ?? true;

    // float with tolerance 
    if (outputType === 'float') {
      const actualNum   = parseFloat(actual);
      const expectedNum = parseFloat(expected);
      if (isNaN(actualNum) || isNaN(expectedNum)) return false;
      return Math.abs(actualNum - expectedNum) <= tolerance;
    }

    // string with case sensitivity 
    if (outputType === 'string') {
      if (!caseSensitive) {
        return String(actual).toLowerCase() === String(expected).toLowerCase();
      }
      return String(actual) === String(expected);
    }

    //  array with order sensitivity 
    if (outputType === 'array_int' || outputType === 'array_char') {
      if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
      if (actual.length !== expected.length) return false;

      if (!isOrdered) {
        // sort both before comparing — handles Two Sum [0,1] vs [1,0]
        const sortedActual   = [...actual].sort((a, b) => (a > b ? 1 : -1));
        const sortedExpected = [...expected].sort((a, b) => (a > b ? 1 : -1));
        return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
      }

      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    //  default: strict equality 
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

}
