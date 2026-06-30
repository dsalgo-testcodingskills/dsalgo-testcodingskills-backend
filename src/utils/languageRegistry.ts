import {
  TEST_CODE_FOR_CPP,
  TEST_CODE_FOR_JAVA,
  TEST_CODE_FOR_PYTHON,
  TEST_CODE_FOR_JS,
  TEST_CODE_FOR_GO,
  TEST_CODE_FOR_CSHARP,
  TEST_CODE_FOR_TYPESCRIPT,
  TEST_CODE_FOR_RUST,
  TEST_CODE_FOR_SWIFT,
  TEST_CODE_FOR_PHP,
  TEST_CODE_FOR_RUBY,
  TEST_CODE_FOR_KOTLIN,
  CPP_SOLUTION_TEMPLATE,
  JAVA_SOLUTION_TEMPLATE,
  PYTHON_SOLUTION_TEMPLATE,
  JAVASCRIPT_SOLUTION_TEMPLATE,
  GO_SOLUTION_TEMPLATE,
  CSHARP_SOLUTION_TEMPLATE,
  TYPESCRIPT_SOLUTION_TEMPLATE,
  KOTLIN_SOLUTION_TEMPLATE,
  RUBY_SOLUTION_TEMPLATE,
  SWIFT_SOLUTION_TEMPLATE,
  TEST_CODE_FOR_C,
  C_SOLUTION_TEMPLATE,
  QUESTION_INPUT_TYPE,
  PHP_SOLUTION_TEMPLATE,
  RUST_SOLUTION_TEMPLATE,
  TEST_CODE_FOR_SCALA,
  SCALA_SOLUTION_TEMPLATE,
  TEST_CODE_FOR_ELIXIR,
  ELIXIR_SOLUTION_TEMPLATE,
} from './constants';

export interface LanguageConfig {
  dataTypeMap: Record<string, string>;
  wrapper: string;
  template: string;
  formatArgument: (type: string, value: any) => string;
  formatParameters: (params: { type: string; paramName: string }[], getDataType: (lang: string, type: string) => string, outputType?: string) => string;
  getInvocation: (functionCall: string, outputType: string, getDataType: (lang: string, type: string) => string) => string;
  formatInvocationArgument?: (param: { type: string; paramName: string }, value: string) => string;
  buildInvocation?: (
  inputTypes: QUESTION_INPUT_TYPE[],
  testCaseInput: any[],
  outputType: string,
  testCaseOutput?: any
) => string;
}

const defaultFormatArgument = (type: string, value: any) => {
  if (type === 'boolean' && typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  return JSON.stringify(value);
};

const defaultFormatParameters = (params: { type: string; paramName: string }[]) => {
  return params.map(p => p.paramName).join(', ');
};

export const LANGUAGE_REGISTRY: Record<string, LanguageConfig> = {
  cpp: {
    wrapper: TEST_CODE_FOR_CPP,
    template: CPP_SOLUTION_TEMPLATE,
    dataTypeMap: {
      '2d_array_int': 'vector<vector<int>>',
      'array_int': 'vector<int>',
      '2d_array_char': 'vector<vector<char>>',
      'array_char': 'vector<char>',
      'boolean': 'bool',
      'string': 'string',
      'float': 'float',
      'int': 'int',
      char: 'char',
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `vector<vector<int>>{${val.map((subArr: any) => `{${subArr.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `vector<vector<char>>{${val.map((subArr: any) => `{${JSON.stringify(subArr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `vector<int>{${val.join(',')}}`;
      if (type === 'array_char') return `vector<char>{${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      if (type === 'char') return `'${val}'`;
      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) => params.map(p => `${getDT('cpp', p.type)} ${p.paramName}`).join(', '),
    getInvocation: (call, outType, getDT) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `${getDT('cpp', outType)} arr = ${call}; cout<<"<logsOutputSeprator>";for(int i=0;i<arr.size();i++)cout<<arr[i]<<" ";`;
      }
      if (outType === 'char') {
        return `
        char value = ${call};
        cout<<"<logsOutputSeprator>"<<value;
        `;
      }
      return `${getDT('cpp', outType)} value = ${call}; cout<<"<logsOutputSeprator>"<<value;`;
    }
  },
  java: {
    wrapper: TEST_CODE_FOR_JAVA,
    template: JAVA_SOLUTION_TEMPLATE,
    dataTypeMap: {
      '2d_array_int': 'int[][]',
      'array_int': 'int[]',
      '2d_array_char': 'char[][]',
      'array_char': 'char[]',
      'string': 'String',
      'float': 'float',
      'int': 'int',
      'boolean': 'boolean',
      char: 'char',
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `new int[][] {${val.map((arr: any) => `{${arr.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `new char[][] {${val.map((arr: any) => `new char[] {${JSON.stringify(arr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `new int[] {${val.join(',')}}`;
      if (type === 'array_char') return `new char[] {${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      if (type === 'char') return `'${val}'`;
      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) => params.map(p => `${getDT('java', p.type)} ${p.paramName}`).join(', '),
    getInvocation: (call, outType, getDT) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `${getDT('java', outType)} arr = ${call}; System.out.print("<logsOutputSeprator>");for(int i=0;i<arr.length;i++)System.out.print(arr[i]+" ");`;
      }
      if (outType === 'char') {
        return `
        char value = ${call};
        System.out.print("<logsOutputSeprator>"+value);
        `;
      }
      return `${getDT('java', outType)} value = ${call}; System.out.print("<logsOutputSeprator>"+value);`;
    }
  },
  python: {
    wrapper: TEST_CODE_FOR_PYTHON,
    template: PYTHON_SOLUTION_TEMPLATE,
    dataTypeMap: {},
    formatArgument: (type, val) => {
      if (type === 'boolean') return JSON.stringify(val).charAt(0).toUpperCase() + JSON.stringify(val).slice(1);
      return JSON.stringify(val);
    },
    formatParameters: (params) => params.map(p => p.paramName).join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `arr=${call};\nprint("<logsOutputSeprator>",end='');\nfor el in arr:\n\tprint(el,end=' ');`;
      }
      return `value=${call};\nprint("<logsOutputSeprator>",value,end='',sep='');`;
    }
  },
  javascript: {
    wrapper: TEST_CODE_FOR_JS,
    template: JAVASCRIPT_SOLUTION_TEMPLATE,
    dataTypeMap: {},
    formatArgument: (type, val) => JSON.stringify(val),
    formatParameters: (params) => params.map(p => p.paramName).join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `let arr = ${call}; if(arr) console.log("<logsOutputSeprator>",...arr);else console.log("<logsOutputSeprator>",arr);`;
      }
      return `let value = ${call}; console.log("<logsOutputSeprator>",value);`;
    }
  },
  typescript: {
    wrapper: TEST_CODE_FOR_TYPESCRIPT,
    template: TYPESCRIPT_SOLUTION_TEMPLATE,
    dataTypeMap: {
      '2d_array_int': 'number[][]',
      'array_int': 'number[]',
      '2d_array_char': 'string[][]',
      'array_char': 'string[]',
      'boolean': 'boolean',
      'string': 'string',
      'float': 'number',
      'int': 'number',
      'char': 'string',
    },
    formatArgument: (type, val) => JSON.stringify(val),
    formatParameters: (params, getDT) => params.map(p => `${p.paramName}: ${getDT('typescript', p.type)}`).join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `let arr = ${call}; if(arr) console.log("<logsOutputSeprator>",...arr);else console.log("<logsOutputSeprator>",arr);`;
      }
      return `let value = ${call}; console.log("<logsOutputSeprator>",value);`;
    }
  },
  go: {
    wrapper: TEST_CODE_FOR_GO,
    template: GO_SOLUTION_TEMPLATE,
    dataTypeMap: {
      '2d_array_int': '[][]int',
      'array_int': '[]int',
      '2d_array_char': '[][]rune',
      'array_char': '[]rune',
      'boolean': 'bool',
      'string': 'string',
      'float': 'float64',
      'int': 'int',
      'char': 'rune',
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `[][]int{${val.map((row: any) => `{${row.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `[][]rune{${val.map((row: any) => `[]rune{${JSON.stringify(row).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `[]int{${val.join(',')}}`;
      if (type === 'array_char') return `[]rune{${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      if (type === 'char') return `'${val}'`;
      return `${JSON.stringify(val)}`;
    },
    formatParameters: (params, getDT) => params.map(p => `${p.paramName} ${getDT('go', p.type)}`).join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `arr := ${call}; fmt.Print("<logsOutputSeprator>"); for i := 0; i < len(arr); i++ { fmt.Print(arr[i], " ") }`;
      }
      if (outType === 'char') {
        return `
        value := ${call}
        fmt.Printf("<logsOutputSeprator>%c", value)
        `;
      }
      return `value := ${call}; fmt.Printf("<logsOutputSeprator>%v\\n", value)`;
    }
  },
  csharp: {
    wrapper: TEST_CODE_FOR_CSHARP,
    template: CSHARP_SOLUTION_TEMPLATE,
    dataTypeMap: {
      '2d_array_int': 'int[][]',
      'array_int': 'int[]',
      '2d_array_char': 'char[][]',
      'array_char': 'char[]',
      'boolean': 'bool',
      'string': 'string',
      'float': 'float',
      'int': 'int',
      'char': 'char',
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `new int[][] {${val.map((arr: any) => `new int[] {${arr.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `new char[][] {${val.map((arr: any) => `new char[] {${JSON.stringify(arr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `new int[] {${val.join(',')}}`;
      if (type === 'array_char') return `new char[] {${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      if (type === 'char') return `'${val}'`;
      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) => params.map(p => `${getDT('csharp', p.type)} ${p.paramName}`).join(', '),
    getInvocation: (call, outType, getDT) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `${getDT('csharp', outType)} arr = ${call}; Console.Write("<logsOutputSeprator>");for(int i=0;i<arr.Length;i++)Console.Write(arr[i]+" ");`;
      }
      if (outType === 'char') {
        return `
        char value = ${call};
        Console.Write("<logsOutputSeprator>"+value);
        `;
      }
      return `${getDT('csharp', outType)} value = ${call}; Console.Write("<logsOutputSeprator>"+value);`;
    }
  },
  rust: {
    wrapper: TEST_CODE_FOR_RUST,
    template: RUST_SOLUTION_TEMPLATE,
    dataTypeMap: {
      '2d_array_int': 'Vec<Vec<i32>>',
      'array_int': 'Vec<i32>',
      '2d_array_char': 'Vec<Vec<char>>',
      'array_char': 'Vec<char>',
      'boolean': 'bool',
      'string': 'String',
      'float': 'f64',
      'int': 'i32',
      'char': 'char',
    },
    formatArgument: (type, val) => {
      switch (type) {
        case 'char':
          return `'${val}'`;

        case 'int':
          return String(val);

        case 'float':
          return String(val);

        case 'boolean':
          return val ? 'true' : 'false';

        case 'string':
          return `"${String(val).replace(/"/g, '\\"')}".to_string()`;

        case 'array_int':
          return `vec![${val.join(',')}]`;

        case 'array_char':
          return `vec![${val.map((c: string) => `'${c}'`).join(',')}]`;

        case '2d_array_int':
          return `vec![${val
            .map((row: any[]) => `vec![${row.join(',')}]`)
            .join(',')}]`;

        case '2d_array_char':
          return `vec![${val
            .map(
              (row: string[]) =>
                `vec![${row.map((c) => `'${c}'`).join(',')}]`
            )
            .join(',')}]`;

        default:
          return JSON.stringify(val);
      }
    },
    formatParameters: (params, getDT) => params.map(p => `${p.paramName}: ${getDT('rust', p.type)}`).join(', '),
    getInvocation: (call) => `let value = ${call}; print!("<logsOutputSeprator>{}", value);`
  },
  php: {
    wrapper: TEST_CODE_FOR_PHP,
    template: PHP_SOLUTION_TEMPLATE,
    dataTypeMap: {
      int: 'int',
      float: 'float',
      boolean: 'bool',
      char: 'string',
      string: 'string',

      array_int: 'array',
      array_char: 'array',
      '2d_array_int': 'array',
      '2d_array_char': 'array',
    },
    formatArgument: (type, val) => {
      if (type === 'boolean') {
        return val ? 'true' : 'false';
      }

      if (type === 'char') {
        return `'${val}'`;
      }

      if (type === 'string') {
        return JSON.stringify(val);
      }

      if (
        type === 'array_int' ||
        type === 'array_char' ||
        type === '2d_array_int' ||
        type === '2d_array_char'
      ) {
        return JSON.stringify(val);
      }

      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) =>
      params
        .map(p => `${getDT('php', p.type)} $${p.paramName}`)
        .join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `
        $arr = ${call};
        echo "<logsOutputSeprator>";
        if ($arr !== null) {
            foreach ($arr as $el) {
                echo $el . " ";
            }
        }
        `;
      }

      if (outType === '2d_array_int' || outType === '2d_array_char') {
        return `
        $arr = ${call};
        echo "<logsOutputSeprator>";
        if ($arr !== null) {
            foreach ($arr as $row) {
                foreach ($row as $el) {
                    echo $el . " ";
                }
                echo "\\n";
            }
        }
        `;
      }

      if (outType === 'boolean') {
        return `
        $value = ${call};
        echo "<logsOutputSeprator>" . ($value ? "true" : "false");
        `;
      }

      return `
        $value = ${call};
        echo "<logsOutputSeprator>" . $value;
        `;
    }
  },
  kotlin: {
    wrapper: TEST_CODE_FOR_KOTLIN,
    template: KOTLIN_SOLUTION_TEMPLATE,

    dataTypeMap: {
      '2d_array_int': 'Array<IntArray>',
      'array_int': 'IntArray',

      '2d_array_char': 'Array<CharArray>',
      'array_char': 'CharArray',

      'string': 'String',
      'float': 'Double',
      'int': 'Int',
      'boolean': 'Boolean',
      'char': 'Char',
    },

    formatArgument: (type, val) => {
      if (type === '2d_array_int') {
        return `arrayOf(${val
          .map((row: any) => `intArrayOf(${row.join(',')})`)
          .join(',')})`;
      }

      if (type === 'array_int') {
        return `intArrayOf(${val.join(',')})`;
      }

      if (type === '2d_array_char') {
        return `arrayOf(${val
          .map(
            (row: any) =>
              `charArrayOf(${row.map((c: string) => `'${c}'`).join(',')})`
          )
          .join(',')})`;
      }

      if (type === 'array_char') {
        return `charArrayOf(${val.map((c: string) => `'${c}'`).join(',')})`;
      }

      if (type === 'string') {
        return JSON.stringify(val);
      }

      if (type === 'char') {
        return `'${val}'`;
      }

      return JSON.stringify(val);
    },

    formatParameters: (params, getDT) =>
      params
        .map(p => `${p.paramName}: ${getDT('kotlin', p.type)}`)
        .join(', '),

    getInvocation: (call, outType, getDT) => {

      if (outType === 'array_int') {
        return `
val arr: ${getDT('kotlin', outType)} = ${call}
print("<logsOutputSeprator>")
for(el in arr){
    print("$el ")
}
`;
      }

      if (outType === 'array_char') {
        return `
val arr: ${getDT('kotlin', outType)} = ${call}
print("<logsOutputSeprator>")
for(el in arr){
    print("$el ")
}
`;
      }

      return `
val value: ${getDT('kotlin', outType)} = ${call}
print("<logsOutputSeprator>$value")
`;
    }
  },
  ruby: {
  wrapper: TEST_CODE_FOR_RUBY,
  template: RUBY_SOLUTION_TEMPLATE,

  dataTypeMap: {},

  formatArgument: (type, val) => {
    if (type === 'boolean') {
      return val ? 'true' : 'false';
    }

    if (type === 'array_char') {
      return `[${val.map((c: string) => `'${c}'`).join(',')}]`;
    }

    return JSON.stringify(val);
  },

  formatParameters: (params) =>
    params.map(p => p.paramName).join(', '),

  getInvocation: (call, outType) => {

    if (outType === 'array_int' || outType === 'array_char') {
      return `
arr = ${call}
print "<logsOutputSeprator>"
arr.each { |el| print "#{el} " }
`;
    }

    return `
value = ${call}
print "<logsOutputSeprator>#{value}"
`;
  }
},
 swift: {
      wrapper: TEST_CODE_FOR_SWIFT,
      template: SWIFT_SOLUTION_TEMPLATE,

      dataTypeMap: {
        'int': 'Int',
        'float': 'Double',
        'boolean': 'Bool',
        'string': 'String',
        'array_int': '[Int]',
        'array_char': '[Character]',
        '2d_array_int': '[[Int]]',
        '2d_array_char': '[[Character]]',
        'char': 'Character',
      },

      formatArgument: (type, val) => {
        if (type === 'array_int') {
          return `[${val.join(',')}]`;
        }

        if (type === '2d_array_int') {
          return `[${val.map((r: any) => `[${r.join(',')}]`).join(',')}]`;
        }

        if (type === 'array_char') {
          return `[${val.map((c: string) => `"${c}"`).join(',')}]`;
        }

        if (type === '2d_array_char') {
          return `[${val.map((r: any) =>
            `[${r.map((c: string) => `"${c}"`).join(',')}]`
          ).join(',')}]`;
        }

        if (type === 'string' || type === 'char') {
          return `"${val}"`;
        }

        if (type === 'boolean') {
          return val ? 'true' : 'false';
        }

        return String(val);
      },

      formatParameters: (params, getDT) =>
        params
          .map(p => `${p.paramName}: ${getDT('swift', p.type)}`)
          .join(', '),

      getInvocation: (call, outType) => {
        if (outType === 'array_int' || outType === 'array_char') {
                  return `
        let arr = ${call}
        print("<logsOutputSeprator>", terminator: "")
        for el in arr {
            print(el, terminator: " ")
        }
        `;
                }
        if (outType === 'char') {
          return `
          let value = ${call}
          print("<logsOutputSeprator>\\(value)", terminator:"")
          `;  
        }
                return `
        let value = ${call}
        print("<logsOutputSeprator>\\(value)", terminator: "")
        `;
              },
      formatInvocationArgument: (param, value) =>
    `${param.paramName}: ${value}`,
    },
  c: {
    wrapper: TEST_CODE_FOR_C,
    template: C_SOLUTION_TEMPLATE,

    dataTypeMap: {
      int: 'int',
      float: 'float',
      boolean: 'bool',
      string: 'char*',
      array_int: 'int*',
      array_char: 'char*',
      '2d_array_int': 'int**',
      '2d_array_char': 'char**',
      char: 'char',
    },
    formatArgument: (type, val) => {

      if (type === 'array_int') {
        return `(int[]){${val.join(',')}}`;
      }
      if (type === 'char') {
        return `'${val}'`;
      }
      if (type === 'string') {
        return `"${val}"`;
      }

      if (type === 'boolean') {
        return val ? 'true' : 'false';
      }
      if (type === 'array_char') {
        return `(char[]){${val.map(ch => `'${ch}'`).join(',')}}`;
      }
      return JSON.stringify(val);
    },

    formatParameters: (params, getDT, outputType) => {
      const result: string[] = [];

      for (const p of params) {
        result.push(`${getDT('c', p.type)} ${p.paramName}`);

        if (p.type === 'array_int') {
          result.push(`int ${p.paramName}Size`);
        }

        if (p.type === 'array_char') {
          result.push(`int ${p.paramName}Size`);
        }

        if (p.type === '2d_array_int') {
          result.push(`int ${p.paramName}RowSize`);
          result.push(`int ${p.paramName}ColSize`);
        }

        if (p.type === '2d_array_char') {
          result.push(`int ${p.paramName}RowSize`);
          result.push(`int ${p.paramName}ColSize`);
        }
      }

      if (outputType === 'array_int' || outputType === 'array_char') {
        result.push(`int* returnSize`);
      } else if (outputType === '2d_array_int' || outputType === '2d_array_char') {
        result.push(`int* returnSize`);
        result.push(`int** returnColumnSizes`);
      }

      return result.join(', ');
    },
    getInvocation: (call, outType) => {

              if (outType === 'array_int') {
                return `
        int* arr = ${call};
        printf("<logsOutputSeprator>");
        `;
              }

              if (outType === 'string') {
                return `
        char* value = ${call};
        printf("<logsOutputSeprator>%s", value);
        `;
              }

              if (outType === 'boolean') {
                return `
        bool value = ${call};
        printf("<logsOutputSeprator>%s", value ? "true" : "false");
        `;
              }
              if (outType === 'char') {
                return `
        char value = ${call};
        printf("<logsOutputSeprator>%c", value);
        `;
              }
              return `
        int value = ${call};
        printf("<logsOutputSeprator>%d", value);
        `;
    },
    buildInvocation: (inputTypes, testCaseInput, outputType, testCaseOutput) => {
      let declarations = [];
      let argumentsList = [];

      for (let i = 0; i < inputTypes.length; i++) {
        const param = inputTypes[i];
        const value = testCaseInput[i];

        if (param.type === 'array_int') {
          declarations.push(
            `int ${param.paramName}[] = {${value.join(',')}};`
          );

          argumentsList.push(param.paramName);
          argumentsList.push(`${value.length}`);
        } else if (param.type === 'array_char') {
          declarations.push(
            `char ${param.paramName}[] = {${value.map(ch => `'${ch}'`).join(',')}, '\\0'};`
          );
          argumentsList.push(param.paramName);
          argumentsList.push(`${value.length}`);
        } else if (param.type === '2d_array_int') {

          const rowNames: string[] = [];

          value.forEach((row, index) => {
            const rowName = `${param.paramName}Row${index}`;

            declarations.push(
              `int ${rowName}[] = {${row.join(',')}};`
            );

            rowNames.push(rowName);
          });

          declarations.push(
            `int* ${param.paramName}[] = {${rowNames.join(',')}};`
          );

          argumentsList.push(param.paramName);
          argumentsList.push(`${value.length}`);
          argumentsList.push(`${value[0].length}`);
        } else if (param.type === '2d_array_char') {

          const rowNames: string[] = [];

          value.forEach((row, index) => {
            const rowName = `${param.paramName}Row${index}`;

            declarations.push(
              `char ${rowName}[] = {${row.map(ch => `'${ch}'`).join(',')}, '\\0'};`
            );

            rowNames.push(rowName);
          });

          declarations.push(
            `char* ${param.paramName}[] = {${rowNames.join(',')}};`
          );

          argumentsList.push(param.paramName);
          argumentsList.push(`${value.length}`);
          argumentsList.push(`${value[0].length}`);
        } else if (param.type === 'char') {
          argumentsList.push(`'${value}'`);
        } else if (param.type === 'string') {
          argumentsList.push(JSON.stringify(value));
        } else {
          argumentsList.push(JSON.stringify(value));
        }
      }

      if (outputType === 'array_int' || outputType === 'array_char') {
        declarations.push(`int returnSize;`);
        argumentsList.push(`&returnSize`);
      } else if (outputType === '2d_array_int' || outputType === '2d_array_char') {
        declarations.push(`int returnSize;`);
        declarations.push(`int* returnColumnSizes;`);
        argumentsList.push(`&returnSize`);
        argumentsList.push(`&returnColumnSizes`);
      }

      const functionCall = `solution(${argumentsList.join(', ')})`;

      if (outputType === 'int') {
        return `
      ${declarations.join('\n')}

      int value = ${functionCall};
      printf("<logsOutputSeprator>%d", value);
      `;
          } else if (outputType === 'float') {
            return `
      ${declarations.join('\n')}

      float value = ${functionCall};
       printf("<logsOutputSeprator>%f", value);
      `;
          } else if (outputType === 'boolean') {
            return `
      ${declarations.join('\n')}

          bool value = ${functionCall};
          printf("<logsOutputSeprator>%s", value ? "true" : "false");
          `;
              }
              else if (outputType === 'char') {
           return `
        ${declarations.join('\n')}

        char value = ${functionCall};
        printf("<logsOutputSeprator>%c", value);
        `;  
              }
              else if (outputType === 'string' || outputType === 'array_char') {
                return `
          ${declarations.join('\n')}

        char* value = ${functionCall};
        printf("<logsOutputSeprator>%s", value);
        `;
              } else if (outputType === 'array_int') {
                return `
        ${declarations.join('\n')}

        int* arr = ${functionCall};
        printf("<logsOutputSeprator>");
        if (arr != NULL) {
            for(int i = 0; i < returnSize; i++) {
                printf("%d ", arr[i]);
            }
        }
        `;
        }

        return `
        ${declarations.join('\n')}

        ${functionCall};
        `;
    }
  },
  scala: {
    wrapper: TEST_CODE_FOR_SCALA,
    template: SCALA_SOLUTION_TEMPLATE,

    dataTypeMap: {
      int: "Int",
      float: "Float",
      boolean: "Boolean",
      string: "String",
      char: "Char",

      array_int: "Array[Int]",
      array_char: "Array[Char]",

      "2d_array_int": "Array[Array[Int]]",
      "2d_array_char": "Array[Array[Char]]",
    },

    formatArgument: (type, val) => {

      if (type === "int" || type === "float") {
        return String(val);
      }

      if (type === "boolean") {
        return val ? "true" : "false";
      }

      if (type === "string") {
        return JSON.stringify(val);
      }

      if (type === "char") {
        return `'${val}'`;
      }

      if (type === "array_int") {
        return `Array(${val.join(",")})`;
      }

      if (type === "array_char") {
        return `Array(${val.map(ch => `'${ch}'`).join(",")})`;
      }

      if (type === "2d_array_int") {
        return `Array(${val
          .map(row => `Array(${row.join(",")})`)
          .join(",")})`;
      }

      if (type === "2d_array_char") {
        return `Array(${val
          .map(row => `Array(${row.map(ch => `'${ch}'`).join(",")})`)
          .join(",")})`;
      }

      return JSON.stringify(val);
    },

    formatParameters: (params, getDT) =>
      params
        .map(p => `${p.paramName}: ${getDT("scala", p.type)}`)
        .join(", "),

    getInvocation: (call, outType) => {

      if (outType === "array_int" || outType === "array_char") {
        return `
        val arr = ${call}
        print("<logsOutputSeprator>")
        arr.foreach(x => print(s"$x "))
        `;
      }

      if (outType === "2d_array_int" || outType === "2d_array_char") {
        return `
        val arr = ${call}
        print("<logsOutputSeprator>")
        arr.foreach(row => {
          row.foreach(x => print(s"$x "))
          println()
        })
        `;
      }

      return `
      val value = ${call}
      print("<logsOutputSeprator>")
      print(value)
      `;
    }
  },
  elixir: {
    wrapper: TEST_CODE_FOR_ELIXIR,
    template: ELIXIR_SOLUTION_TEMPLATE,

    dataTypeMap: {},

    formatArgument: (type, val) => {

      if (type === "boolean") {
        return val ? "true" : "false";
      }

      if (type === "string") {
        return JSON.stringify(val);
      }

      if (type === "char") {
        return `"${val}"`;
      }

      if (type === "array_int") {
        return `[${val.join(", ")}]`;
      }

      if (type === "array_char") {
        return `[${val.map(ch => `"${ch}"`).join(", ")}]`;
      }

      if (type === "2d_array_int") {
        return `[${val
          .map(row => `[${row.join(", ")}]`)
          .join(", ")}]`;
      }

      if (type === "2d_array_char") {
        return `[${val
          .map(row => `[${row.map(ch => `"${ch}"`).join(", ")}]`)
          .join(", ")}]`;
      }

      return JSON.stringify(val);
    },

    formatParameters: (params) =>
      params.map(p => p.paramName).join(", "),

    getInvocation: (call, outType) => {
      const elixirCall = call.replace(/^solution\(/, 'Solution.solution(');

      if (
        outType === "array_int" || 
        outType === "array_char" || 
        outType === "2d_array_int" || 
        outType === "2d_array_char"
      ) {
        return `
          arr = ${elixirCall}
          IO.write("<logsOutputSeprator>")
          IO.write(inspect(arr, limit: :infinity, charlists: :as_lists))
          `;
      }

      return `
        value = ${elixirCall}
        IO.write("<logsOutputSeprator>")
        IO.write(to_string(value))
        `;
    }
  }

};

export const getLanguageConfig = (language: string): LanguageConfig => {
  const config = LANGUAGE_REGISTRY[language];

  if (!config) {
    throw new Error(`Language '${language}' is not implemented`);
  }

  return config;
};

export function getLanguageDataType(language: string, paramType: string): string {
  const config = LANGUAGE_REGISTRY[language];
  if (!config) return paramType;

  const mappedType = config.dataTypeMap[paramType];
  if (mappedType) return mappedType;

  if (language === 'c') {
    if (paramType === '2d_array_int') return 'int**';
    if (paramType === 'array_int') return 'int*';
    if (paramType === 'string') return 'char*';
  }

  return paramType;
}
