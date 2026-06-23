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
} from './constants';

export interface LanguageConfig {
  dataTypeMap: Record<string, string>;
  wrapper: string;
  template: string;
  formatArgument: (type: string, value: any) => string;
  formatParameters: (params: { type: string; paramName: string }[], getDataType: (lang: string, type: string) => string) => string;
  getInvocation: (functionCall: string, outputType: string, getDataType: (lang: string, type: string) => string) => string;
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
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `vector<vector<int>>{${val.map((subArr: any) => `{${subArr.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `vector<vector<char>>{${val.map((subArr: any) => `{${JSON.stringify(subArr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `vector<int>{${val.join(',')}}`;
      if (type === 'array_char') return `vector<char>{${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) => params.map(p => `${getDT('cpp', p.type)} ${p.paramName}`).join(', '),
    getInvocation: (call, outType, getDT) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `${getDT('cpp', outType)} arr = ${call}; cout<<"<logsOutputSeprator>";for(int i=0;i<arr.size();i++)cout<<arr[i]<<" ";`;
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
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `new int[][] {${val.map((arr: any) => `{${arr.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `new char[][] {${val.map((arr: any) => `new char[] {${JSON.stringify(arr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `new int[] {${val.join(',')}}`;
      if (type === 'array_char') return `new char[] {${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) => params.map(p => `${getDT('java', p.type)} ${p.paramName}`).join(', '),
    getInvocation: (call, outType, getDT) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `${getDT('java', outType)} arr = ${call}; System.out.print("<logsOutputSeprator>");for(int i=0;i<arr.length;i++)System.out.print(arr[i]+" ");`;
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
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `[][]int{${val.map((row: any) => `{${row.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `[][]rune{${val.map((row: any) => `[]rune{${JSON.stringify(row).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `[]int{${val.join(',')}}`;
      if (type === 'array_char') return `[]rune{${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      return `${JSON.stringify(val)}`;
    },
    formatParameters: (params, getDT) => params.map(p => `${p.paramName} ${getDT('go', p.type)}`).join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `arr := ${call}; fmt.Print("<logsOutputSeprator>"); for i := 0; i < len(arr); i++ { fmt.Print(arr[i], " ") }`;
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
    },
    formatArgument: (type, val) => {
      if (type === '2d_array_int') return `new int[][] {${val.map((arr: any) => `new int[] {${arr.join(',')}}`).join(',')}}`;
      if (type === '2d_array_char') return `new char[][] {${val.map((arr: any) => `new char[] {${JSON.stringify(arr).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`).join(',')}}`;
      if (type === 'array_int') return `new int[] {${val.join(',')}}`;
      if (type === 'array_char') return `new char[] {${JSON.stringify(val).replace(/^\[|\]$/g, '').replace(/"/g, "'")}}`;
      return JSON.stringify(val);
    },
    formatParameters: (params, getDT) => params.map(p => `${getDT('csharp', p.type)} ${p.paramName}`).join(', '),
    getInvocation: (call, outType, getDT) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `${getDT('csharp', outType)} arr = ${call}; Console.Write("<logsOutputSeprator>");for(int i=0;i<arr.Length;i++)Console.Write(arr[i]+" ");`;
      }
      return `${getDT('csharp', outType)} value = ${call}; Console.Write("<logsOutputSeprator>"+value);`;
    }
  },
  rust: {
    wrapper: TEST_CODE_FOR_RUST,
    template: `pub fn solution(parameters) -> return_type {\n    \n}`,
    dataTypeMap: {
      '2d_array_int': 'Vec<Vec<i32>>',
      'array_int': 'Vec<i32>',
      '2d_array_char': 'Vec<Vec<char>>',
      'array_char': 'Vec<char>',
      'boolean': 'bool',
      'string': 'String',
      'float': 'f64',
      'int': 'i32',
    },
    formatArgument: (type, val) => {
      switch (type) {
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
    template: `function solution(parameters) {\n    \n}`,
    dataTypeMap: {},
    formatArgument: (type, val) => JSON.stringify(val),
    formatParameters: (params) => params.map(p => `$${p.paramName}`).join(', '),
    getInvocation: (call, outType) => {
      if (outType === 'array_int' || outType === 'array_char') {
        return `$arr = ${call}; echo "<logsOutputSeprator>"; foreach($arr as $el) echo $el . " ";`;
      }
      return `$value = ${call}; echo "<logsOutputSeprator>" . $value;`;
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
