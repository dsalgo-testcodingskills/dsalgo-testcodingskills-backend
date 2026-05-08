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
            : `${testCaseInput[i]},`;
      } else if (language === 'typescript') {
        functionArguments +=
          inputType[i].type === 'array_int' ||
          inputType[i].type === 'array_char' ||
          inputType[i].type === '2d_array_int' ||
          inputType[i].type === '2d_array_char'
            ? JSON.stringify(testCaseInput[i]) + ','
            : `${testCaseInput[i]},`;
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
        return `auto __start_time = std::chrono::high_resolution_clock::now(); ${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall}; auto __end_time = std::chrono::high_resolution_clock::now(); double __runtime = std::chrono::duration_cast<std::chrono::nanoseconds>(__end_time - __start_time).count() / 1e6; cout<<"<logsOutputSeprator>";for(int i=0;i<${
          question.testCases[testCaseIndex].output.length
        };i++)cout<<arr[i]<<" "; cout<<"<runtimeSeprator>"<<__runtime;`;
      } else {
        return `auto __start_time = std::chrono::high_resolution_clock::now(); ${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall}; auto __end_time = std::chrono::high_resolution_clock::now(); double __runtime = std::chrono::duration_cast<std::chrono::nanoseconds>(__end_time - __start_time).count() / 1e6; cout<<"<logsOutputSeprator>"<<value<<"<runtimeSeprator>"<<__runtime;`;
      }
    } else if (language === 'java') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `long __startTime = System.nanoTime(); ${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall}; long __endTime = System.nanoTime(); double __runtime = (__endTime - __startTime) / 1000000.0; System.out.print("<logsOutputSeprator>");for(int i=0;i<arr.length;i++)System.out.print(arr[i]+" "); System.out.print("<runtimeSeprator>"+__runtime);`;
      } else {
        return `long __startTime = System.nanoTime(); ${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall}; long __endTime = System.nanoTime(); double __runtime = (__endTime - __startTime) / 1000000.0; System.out.print("<logsOutputSeprator>"+value+"<runtimeSeprator>"+__runtime);`;
      }
    } else if (language === 'python') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `__start_time=time.perf_counter();\narr=${functionCall};\n__end_time=time.perf_counter();\n__runtime=(__end_time-__start_time)*1000;\nprint("<logsOutputSeprator>",end='');\nfor el in arr:\n\tprint(el,end=' ');\nprint("<runtimeSeprator>",__runtime,end='',sep='');`;
      } else {
        return `__start_time=time.perf_counter();\nvalue=${functionCall};\n__end_time=time.perf_counter();\n__runtime=(__end_time-__start_time)*1000;\nprint("<logsOutputSeprator>",value,"<runtimeSeprator>",__runtime,end='',sep='');`;
      }
    } else if (language === 'javascript') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `const __startTime = process.hrtime.bigint(); arr = ${functionCall}; const __endTime = process.hrtime.bigint(); const __runtime = Number(__endTime - __startTime) / 1000000; if(arr) console.log("<logsOutputSeprator>",...arr,"<runtimeSeprator>",__runtime);else console.log("<logsOutputSeprator>",arr,"<runtimeSeprator>",__runtime);`;
      } else {
        return `const __startTime = process.hrtime.bigint(); value = ${functionCall}; const __endTime = process.hrtime.bigint(); const __runtime = Number(__endTime - __startTime) / 1000000; console.log("<logsOutputSeprator>",value,"<runtimeSeprator>",__runtime);`;
      }
    } else if (language === 'go') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `__startTime := time.Now(); arr := ${functionCall}; __duration := time.Since(__startTime); __runtime := float64(__duration.Nanoseconds()) / 1e6; fmt.Print("<logsOutputSeprator>"); for i := 0; i < len(arr); i++ { fmt.Print(arr[i], " ") }; fmt.Printf("<runtimeSeprator>%f", __runtime)`;
      } else {
        return `__startTime := time.Now(); value := ${functionCall}; __duration := time.Since(__startTime); __runtime := float64(__duration.Nanoseconds()) / 1e6; fmt.Printf("<logsOutputSeprator>%v<runtimeSeprator>%f\\n", value, __runtime)`;
      }
    } else if (language === 'csharp') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `Stopwatch __stopwatch = new Stopwatch(); __stopwatch.Start(); ${getDatatypeOfParamters(
          language,
          question.outputType,
        )} arr = ${functionCall}; __stopwatch.Stop(); double __runtime = __stopwatch.Elapsed.TotalMilliseconds; Console.Write("<logsOutputSeprator>");for(int i=0;i<arr.Length;i++)Console.Write(arr[i]+" "); Console.Write("<runtimeSeprator>"+__runtime);`;
      } else {
        return `Stopwatch __stopwatch = new Stopwatch(); __stopwatch.Start(); ${getDatatypeOfParamters(
          language,
          question.outputType,
        )} value = ${functionCall}; __stopwatch.Stop(); double __runtime = __stopwatch.Elapsed.TotalMilliseconds; Console.Write("<logsOutputSeprator>"+value+"<runtimeSeprator>"+__runtime);`;
      }
    } else if (language === 'typescript') {
      if (
        question.outputType === 'array_int' ||
        question.outputType === 'array_char'
      ) {
        return `const __startTime = process.hrtime.bigint(); let arr = ${functionCall}; const __endTime = process.hrtime.bigint(); const __runtime = Number(__endTime - __startTime) / 1000000; if(arr) console.log("<logsOutputSeprator>",...arr,"<runtimeSeprator>",__runtime);else console.log("<logsOutputSeprator>",arr,"<runtimeSeprator>",__runtime);`;
      } else {
        return `const __startTime = process.hrtime.bigint(); let value = ${functionCall}; const __endTime = process.hrtime.bigint(); const __runtime = Number(__endTime - __startTime) / 1000000; console.log("<logsOutputSeprator>",value,"<runtimeSeprator>",__runtime);`;
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
      } else convertedOutput = null;
      return convertedOutput;
    } catch (error) {
      return null;
    }
  }

  async executeCode(executeCommand, question, testCaseIndex, language) {
    return new Promise((resolve, reject) => {
      const timedCommand = `/usr/bin/time -f "METRICS:%e %M" sh -c '${executeCommand.replace(/'/g, `'\\''`)}'`;
      exec(timedCommand, { timeout: 10000 }, async (error, stdout, stderr) => {
        let runtime = 0;
        let memory = 0;
        if (stderr) {
            const metricsMatch = stderr.match(/METRICS:([\d\.]+)\s+(\d+)/);
            if (metricsMatch) {
               runtime = parseFloat(metricsMatch[1]);
               memory = parseInt(metricsMatch[2], 10);
               stderr = stderr.replace(/METRICS:[\d\.]+\s+\d+\n?/, '').trim();
            }
        }

        if (stdout) {
          const runtimeParts = stdout.split('<runtimeSeprator>');
          if (runtimeParts.length > 1) {
            runtime = parseFloat(runtimeParts[1].trim());
            stdout = runtimeParts[0];
          }

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
              runtime,
              memory
            });
          } else
            resolve({
              result: false,
              logs: userLogs,
              hidden: question.testCases[testCaseIndex].hidden,
              actualOutput: userOutput ? userOutput.trim() : '',
              runtime,
              memory
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
            runtime,
            memory
          });
        } else if (error) {
          reject({
            result: false,
            logs: 'Code execution failed due to some error on server',
            hidden: question.testCases[testCaseIndex].hidden,
            actualOutput: '',
            runtime,
            memory
          });
        } else {
          resolve({
            result: false,
            logs: 'Code execution produced no output.',
            hidden: question.testCases[testCaseIndex].hidden,
            actualOutput: '',
            runtime,
            memory
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
          : language === 'csharp'
          ? TEST_CODE_FOR_CSHARP.replace('SOLUTION_METHOD', code)
          : language === 'typescript'
          ? TEST_CODE_FOR_TYPESCRIPT.replace('SOLUTION_METHOD', code)
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
            : language === 'csharp'
            ? `testCase${i}.cs`
            : language === 'typescript'
            ? `testCase${i}.ts`
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
            : language === 'csharp'
            ? `mcs ${fileName} && mono ${path.join(dirPath, `testCase${i}.exe`)}`
            : language === 'typescript'
            ? `tsc ${fileName} && node ${path.join(dirPath, `testCase${i}.js`)}`
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
