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
  TEST_CODE_FOR_RUST,
  TEST_CODE_FOR_SWIFT,
  TEST_CODE_FOR_PHP,
  TEST_CODE_FOR_RUBY,
  TEST_CODE_FOR_KOTLIN,
  TEST_LANGUAGES,
  JUDGE0_LANGUAGE_IDS,
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  JUDGE0_IN_PROGRESS_STATUSES,
  QUESTION_TYPE,
} from '../utils/constants';
import { getDatatypeOfParamters } from '../common/common.functions';
import { getLanguageConfig } from '../utils/languageRegistry';

@Injectable()
export class CompilerService {
  constructor(
    @InjectModel('questions')
    private readonly questionModel: Model<QuestionDocument>,
    private readonly questionsService: QuestionsService,
  ) { }

  getQuestions() {
    return this.questionsService.getQuestions();
  }

  getQuestion(questionId) {
    return this.questionModel.findById(questionId);
  }

  //Returns the arguments for a function to be inserted in the template.
  async getFunctionArguments(language, inputType, testCaseInput) {
    const config = getLanguageConfig(language);
    const args = [];

    for (let i = 0; i < inputType.length; i++) {
      const val = testCaseInput[i];
      const formatted = config.formatArgument(inputType[i].type, val);

      args.push(
        config.formatInvocationArgument
          ? config.formatInvocationArgument(inputType[i], formatted)
          : formatted
      );
    }

    return args.join(', ');
  }


  async getInvocationCode(language, question, testCaseIndex) {
    if (question.questionType === QUESTION_TYPE.DATABASE) {
      return ''; // SQL questions don't need boilerplate invocation
    }

    const config = getLanguageConfig(language);
    if (config.buildInvocation) {
      return config.buildInvocation(
        question.inputType,
        question.testCases[testCaseIndex].input,
        question.outputType,
        question.testCases[testCaseIndex].output
      );
    }

    let functionCall = `solution(${await this.getFunctionArguments(
      language,
      question.inputType,
      question.testCases[testCaseIndex].input,
    )})`;
    // return config.getInvocation(functionCall, question.outputType, getDatatypeOfParamters);
    const result = config.getInvocation(
    functionCall,
    question.outputType,
    getDatatypeOfParamters
);

return result;
  }


  async getConvertedOutput(
    userOutput: string,
    outputType: string,
    language: string,
  ) {
    console.log("userOutput", userOutput);
    try {
      if (userOutput == null || userOutput === '') {
        return null;
      }

      switch (outputType) {
        case 'int':
          return Number(userOutput);

        case 'float':
          return Number(userOutput);

        case 'boolean': {
          if (language === 'cpp' || language === 'csharp') {
            if (userOutput === '1' || userOutput === 'True') return true;
            if (userOutput === '0' || userOutput === 'False') return false;
          }

          // Python prints True/False
          if (language === 'python') {
            if (userOutput === 'True') return true;
            if (userOutput === 'False') return false;
          }

          // JavaScript / Java / Go / Rust etc.
          if (userOutput === 'true') return true;
          if (userOutput === 'false') return false;

          return JSON.parse(userOutput);
        }

        case 'string':
          return userOutput;

        case 'array_int': {
          const output = userOutput.trim();

          // Rust / JSON style: [0, 1]
          if (output.startsWith('[') && output.endsWith(']')) {
            return JSON.parse(output);
          }

          // Existing format: 0 1
          return output.split(/\s+/).map(Number);
        }

        case 'array_char': {
          const output = userOutput.trim();

          if (output.startsWith('[') && output.endsWith(']')) {
            return JSON.parse(output);
          }

          return output.split(/\s+/);
        }

        case '2d_array_int':
        case '2d_array_char': {
          const output = userOutput.trim();
          if (output.startsWith('[') && output.endsWith(']')) {
            try {
              return JSON.parse(output.replace(/'/g, '"'));
            } catch (e) {
              // ignore
            }
          }
          return userOutput;
        }

        default:
          return userOutput;
      }
    } catch (error) {
      console.error('getConvertedOutput error:', error);
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
      if (!question || !question.testCases) {
        throw new Error('Question details (test cases) are missing or incomplete.');
      }

      // Ensure inputType is at least an empty array to avoid looping errors
      question.inputType = question.inputType || [];

      const languageId = JUDGE0_LANGUAGE_IDS[language];
      console.log("🚀 ~ CompilerService ~ compileAndRun ~ languageId:", languageId)
      if (!languageId) throw new Error(`No Judge0 language ID found for: ${language}`);

      let solution_code = '';

      if (question.questionType === QUESTION_TYPE.DATABASE) {
        solution_code = code; // SQL just runs as is
      } else {
        const config = getLanguageConfig(language);
        let wrapper = config.wrapper;
        //  TEST_CODE_FOR_CPP = `#include<bits/stdc++.h>
        
        // using namespace std;
        
        // SOLUTION_METHOD
        
        // int main() {
        
        //   INVOCATION
        
        // 	return 0;
        // }`;
        if (config.buildWrapper) {
          wrapper = config.buildWrapper(wrapper, question);
        }
        solution_code = wrapper.replace('SOLUTION_METHOD', code);
      }

      const submissions = await Promise.all(
        question.testCases.map(async (_, i) => {
          const invocationCode = await this.getInvocationCode(language, question, i);
          console.log("🚀 ~ CompilerService ~ compileAndRun ~ invocationCode:", invocationCode)
          const sourceCode = solution_code.replace('INVOCATION', invocationCode);

          // For SQL, concatenating setup (input) with query (solution)
          if (question.questionType === QUESTION_TYPE.DATABASE) {
            const setupSql = question.testCases[i].input[0] || '';
            const finalSql = `${setupSql}\n\n-- User Solution\n${code}`;
            return { source_code: finalSql, language_id: languageId };
          }

          return { source_code: sourceCode, language_id: languageId };
        }),
      );

      const timeLimit = Math.min(question.constraints?.timeLimit ?? 2000, 15000) / 1000;
      const memoryLimit = question.constraints?.memoryLimit ?? 256;

      const tokens = await this.submitBatchToJudge0(submissions, timeLimit, memoryLimit);
      console.log("🚀 ~ CompilerService ~ compileAndRun ~ tokens:", tokens)
      const judge0Results = await this.pollBatchResults(tokens);
      console.log("🚀 ~ CompilerService ~ compileAndRun ~ judge0Results:", judge0Results)

      const testCaseResults = await Promise.all(
        judge0Results.map((result, i) =>
          this.processJudge0Result(result, question, i, language),
        ),
      );

      return testCaseResults;
    } catch (error) {
      return [{ result: false, logs: error.message }];
    }
  }

  private async submitBatchToJudge0(
    submissions: { source_code: string; language_id: number }[],
    timeLimit: number = 2,
    memoryLimit: number = 256,
  ) {
    console.log("🚀 ~ CompilerService ~ submitBatchToJudge0 ~ submissions:", submissions)
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
          compilation_limit: 30,                // Increase compilation limit to 20s for slow compilers like Kotlin
          enable_network: false,
        })),
      }),
    });
    console.log("🚀 ~ CompilerService ~ submitBatchToJudge0 ~ response:", response)

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
      console.log("polling");

      const response = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenList}&base64_encoded=true&fields=token,stdout,stderr,compile_output,status,time,memory`,

      );

        if (!response.ok) {
          let errorBody;

          try {
            errorBody = await response.text();
          } catch {
            errorBody = response.statusText;
          }

          throw new Error(
            `Error (${response.status}): ${errorBody}`
          );
        }
      const data = await response.json();
      const submissions = data.submissions;
      console.log("🚀 ~ CompilerService ~ pollBatchResults ~ submissions:", submissions)
      submissions.forEach((s) => {
        s.stdout = this.decodeBase64(s.stdout);
        s.stderr = this.decodeBase64(s.stderr);
        s.compile_output = this.decodeBase64(s.compile_output);
      });
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
      const logs: string[] = [];

      if (judge0Result.compile_output?.trim()) {
        logs.push(`Compilation Warnings:\n${judge0Result.compile_output}`);
      }

      if (judge0Result.stderr?.trim()) {
        logs.push(`Runtime Error:\n${judge0Result.stderr}`);
      }

      if (!logs.length && judge0Result.status?.description) {
        logs.push(judge0Result.status.description);
      }

      return {
        result: false,
        logs: logs.join('\n\n'),
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
      actualOutput: convertedOutput,
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
    const isOrdered = outputConstraints?.isOrdered ?? true;
    const tolerance = outputConstraints?.tolerance ?? 0;
    const caseSensitive = outputConstraints?.caseSensitive ?? true;

    // float with tolerance 
    if (outputType === 'float') {
      const actualNum = parseFloat(actual);
      const expectedNum = parseFloat(expected);
      if (isNaN(actualNum) || isNaN(expectedNum)) return false;
      return Math.abs(actualNum - expectedNum) <= tolerance;
    }

    // string with case sensitivity 
    if (outputType === 'string') {
      let cleanActual = String(actual).trim();
      let cleanExpected = String(expected).trim();

      if ((cleanActual.startsWith('"') && cleanActual.endsWith('"')) || (cleanActual.startsWith("'") && cleanActual.endsWith("'"))) {
        cleanActual = cleanActual.slice(1, -1);
      }
      if ((cleanExpected.startsWith('"') && cleanExpected.endsWith('"')) || (cleanExpected.startsWith("'") && cleanExpected.endsWith("'"))) {
        cleanExpected = cleanExpected.slice(1, -1);
      }

      if (!caseSensitive) {
        return cleanActual.toLowerCase() === cleanExpected.toLowerCase();
      }
      return cleanActual === cleanExpected;
    }

    if (outputType === 'char') {
      let cleanActual = String(actual).trim();
      let cleanExpected = String(expected).trim();

      if ((cleanActual.startsWith('"') && cleanActual.endsWith('"')) || (cleanActual.startsWith("'") && cleanActual.endsWith("'"))) {
        cleanActual = cleanActual.slice(1, -1);
      }
      if ((cleanExpected.startsWith('"') && cleanExpected.endsWith('"')) || (cleanExpected.startsWith("'") && cleanExpected.endsWith("'"))) {
        cleanExpected = cleanExpected.slice(1, -1);
      }
      return cleanActual === cleanExpected;
    }

    if (outputType === 'int') {
      return Number(actual) === Number(expected);
    }

    //  array with order sensitivity 
    if (outputType === 'array_int' || outputType === 'array_char') {
      if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
      if (actual.length !== expected.length) return false;

      if (!isOrdered) {
        // sort both before comparing — handles Two Sum [0,1] vs [1,0]
        const sortedActual = [...actual].sort((a, b) => (a > b ? 1 : -1));
        const sortedExpected = [...expected].sort((a, b) => (a > b ? 1 : -1));
        return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
      }

      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    //  default: strict equality 
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
private decodeBase64(value?: string | null) {
  if (!value) return value;

  return Buffer
    .from(value, 'base64')
    .toString('utf8');
}
}
