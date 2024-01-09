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
  TEST_LANGUAGES,
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
            : `${testCaseInput[i]},`;
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
            : `${testCaseInput[i]},`;
      } else if (language === 'python') {
        functionArguments +=
          inputType[i].type === 'boolean'
            ? JSON.stringify(testCaseInput[i]).charAt(0).toUpperCase() +
              JSON.stringify(testCaseInput[i]).slice(1)
            : inputType[i].type.includes('2d_array')
            ? JSON.stringify(testCaseInput[i]).replace(/\],\[/g, '],\n[') + ','
            : JSON.stringify(testCaseInput[i]) + ',';
      } else if (language === 'javascript') {
        functionArguments +=
          inputType[i].type === 'array_int' ||
          inputType[i].type === 'array_char' ||
          inputType[i].type === '2d_array_int' ||
          inputType[i].type === '2d_array_char'
            ? JSON.stringify(testCaseInput[i]) + ','
            : `${testCaseInput[i]},`;
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
            : `${testCaseInput[i]}, `;
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
        )} arr = ${functionCall};cout<<"<logsOutputSeprator>";for(int i=0;i<${
          question.testCases[testCaseIndex].output.length
        };i++)cout<<arr[i]<<" ";`;
      } else {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall};cout<<"<logsOutputSeprator>"<<value;`;
      }
    } else if (language === 'java') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall};System.out.print("<logsOutputSeprator>");for(int i=0;i<arr.length;i++)System.out.print(arr[i]+" ");`;
      } else {
        return `${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall};System.out.print("<logsOutputSeprator>"+value);`;
      }
    } else if (language === 'python') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `arr=${functionCall};\nprint("<logsOutputSeprator>",end='');\nfor el in arr:\n\tprint(el,end=' ');`;
      } else {
        return `value=${functionCall};\nprint("<logsOutputSeprator>",value,end='');`;
      }
    } else if (language === 'javascript') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `arr = ${functionCall};if(arr) console.log("<logsOutputSeprator>",...arr);else console.log("<logsOutputSeprator>",arr);`;
      } else {
        return `value = ${functionCall};console.log("<logsOutputSeprator>",value);`;
      }
    } else if (language === 'go') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `arr := ${functionCall}; fmt.Print("<logsOutputSeprator>"); for i := 0; i < len(arr); i++ { fmt.Print(arr[i], " ") }`;
      } else {
        return `value := ${functionCall}; fmt.Println("<logsOutputSeprator>", value)`;
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
        if (language === 'cpp' && outputType === 'boolean')
          userOutput =
            userOutput === '1' ? true : userOutput === '0' ? false : userOutput;
        else if (language === 'python' && outputType === 'boolean')
          userOutput =
            userOutput === 'True'
              ? true
              : userOutput === 'False'
              ? false
              : userOutput;
        convertedOutput = JSON.parse(userOutput);
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
            userOutput.trim(),
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
              actualOutput: userOutput.trim(),
            });
          } else
            resolve({
              result: false,
              logs: userLogs,
              hidden: question.testCases[testCaseIndex].hidden,
              actualOutput: userOutput.trim(),
            });
        } else if (stderr) {
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
    dirPath: string,
  ) {
    try {
      let solution_code = '';
      const testCaseResults = [];
      solution_code =
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
          : '';
      for (let i = 0; i < question.testCases.length; i++) {
        let invocationCode = await this.getInvocationCode(
          language,
          question,
          i,
        );
        let sourceCode = solution_code.replace('INVOCATION', invocationCode);
        let fileName =
          language === 'go'
            ? `testCase${i}.go`
            : language === 'python'
            ? `testCase${i}.py`
            : language === 'javascript'
            ? `testCase${i}.js`
            : language === 'java'
            ? `testCase${i}.java`
            : `testCase${i}.cpp`;
        fileName = path.join(dirPath, fileName);

        //g++ -o main.exe hello.cpp   | 'python hello.py' | 'node hello.js' | 'javac hello.java' & 'java hello' | go run hello.go
        let executeCommand =
          language === 'go'
            ? `go run ${fileName}`
            : language === 'python'
            ? `python3 ${fileName}`
            : language === 'javascript'
            ? `node ${fileName}`
            : language === 'cpp'
            ? `g++ -o ${path.join(
                dirPath,
                `testCase${i}`,
              )} ${fileName} && ${path.join(dirPath, `testCase${i}`)}`
            : `javac ${fileName} && java -cp ${dirPath} Solution`;
        let writeToFileStatus = await this.writeToFile(fileName, sourceCode);
        if (writeToFileStatus) {
          let result = await this.executeCode(
            executeCommand,
            question,
            i,
            language,
          );
          testCaseResults.push(result);
        } else return [];
      }
      return testCaseResults;
    } catch (error) {
      return error.message;
    }
  }
}
