# Language Registry — Full Guide for Newcomers

If you're new to this codebase, start here. `languageRegistry.ts` is the
single file that tells our platform, for every supported language (Java,
Python, Rust, ...), how to take a user's `solution()` function and turn it
into a fully runnable program that we can compile, execute, and grade.

This doc walks through **every field** of `LanguageConfig` — what it's for,
when it runs, and a concrete example of its input/output — plus the shared
output-printing architecture that all languages plug into.

---

## 1. The big picture: what actually happens when a user submits code

When a user clicks "Submit" on a coding problem, roughly this happens:

1. We take the user's `solution()` function body.
2. We wrap it inside a bigger chunk of boilerplate code (`wrapper` +
   `template`) that knows how to call `solution()` with the test case
   inputs and print the result.
3. We compile/run that combined file.
4. We read the printed output (between `<logsOutputSeprator>` markers) and
   compare it to the expected answer.

`LanguageConfig` is the object that holds **all the pieces needed to do
step 2** for one specific language. Every field below answers one small
question in that process: "how do I declare a parameter in this language?",
"how do I format a value as a literal?", "how do I print the result?", etc.

```ts
export interface LanguageConfig {
  dataTypeMap: Record<string, string>;
  wrapper: string;
  template: string;
  formatArgument: (type: string, value: any) => string;
  formatParameters: (params, getDataType, outputType?) => string;
  getInvocation: (functionCall: string, outputType: string, getDataType) => string;
  formatInvocationArgument?: (param, value: string) => string;
  buildInvocation?: (inputTypes, testCaseInput, outputType, testCaseOutput?) => string;
  buildWrapper?: (wrapper: string, question: any) => string;
}
```

We'll go through these in the order the pipeline actually uses them.

---

## 2. `dataTypeMap` — "what's this language's name for my internal type?"

```ts
dataTypeMap: {
  '2d_array_int': 'vector<vector<int>>',
  'array_int': 'vector<int>',
  'boolean': 'bool',
  'string': 'string',
  'float': 'float',
  'int': 'int',
  char: 'char',
}
```

**What it's for:** internally, our platform refers to types using our own
plain names — `'int'`, `'array_int'`, `'2d_array_char'`, etc. Every
language calls these something different (`vector<int>` in C++, `int[]` in
Java, `[]int` in Go). `dataTypeMap` is just the lookup table from "our
name" → "this language's name."

**Used through:** the shared helper `getLanguageDataType(language, type)`,
not used directly — see Section9.

```ts
getLanguageDataType('cpp', 'array_int');  // -> 'vector<int>'
getLanguageDataType('go', 'array_int');   // -> '[]int'
getLanguageDataType('python', 'array_int'); // -> 'array_int' (Python has no dataTypeMap entries — it's dynamically typed, so it just returns the input unchanged)
```

Languages that don't need type annotations at all (Python, JavaScript,
Ruby, Elixir, Erlang) just leave this as `{}`.

---

## 3. `wrapper` and `template` — the boilerplate code

```ts
wrapper: TEST_CODE_FOR_CPP,
template: CPP_SOLUTION_TEMPLATE,
```

**What they're for:** these are big strings (imported from `constants.ts`,
not shown in this file) containing the actual skeleton of the generated
program — `#include`s, a `main()` function, placeholders that later get
filled in with the user's code, the test case values, and the invocation
code that `getInvocation` produces.

Think of `template` as "what does the user's editor pre-fill look like"
and `wrapper` as "what extra scaffolding gets wrapped around the user's
function so we can call it and capture output."

`buildWrapper` (Section8) is the only thing in this file allowed to modify
`wrapper` per-question, and only a couple of languages need it.

---

## 4. `formatArgument(type, value)` — turning one test-case value into source code

```ts
formatArgument: (type, val) => {
  if (type === 'array_int') return `vector<int>{${val.join(',')}}`;
  if (type === 'char') return `'${val}'`;
  return JSON.stringify(val);
}
```

**What it's for:** test cases are stored as plain JS values (numbers,
strings, arrays...). Before we can call `solution()` with them inside a
generated C++/Java/Python file, each value has to become a **literal in
that language's syntax**. This function does that conversion, one argument
at a time.

**Example:**

```ts
formatArgument('array_int', [1, 2, 3]);
// cpp    -> "vector<int>{1,2,3}"
// java   -> "new int[] {1,2,3}"
// python -> "[1, 2, 3]"   (via JSON.stringify, which happens to match Python list syntax)
```

This is called once per argument, for every test case, while building the
function-call string that later gets handed to `getInvocation`.

---

## 5. `formatParameters(params, getDataType, outputType?)` — declaring the function signature

```ts
formatParameters: (params, getDT) =>
  params.map(p => `${getDT('cpp', p.type)} ${p.paramName}`).join(', ')
```

**What it's for:** when we generate the function signature the user's code
must match (e.g. for a starter template, or for languages like C that need
explicit return-size parameters), this builds the parameter list string.

**Example:**

```ts
formatParameters(
  [{ type: 'int', paramName: 'n' }, { type: 'array_int', paramName: 'nums' }],
  getLanguageDataType
);
// cpp -> "int n, vector<int> nums"
// go  -> "n int, nums []int"
```

The optional third argument, `outputType`, is only used by C — because C
needs *extra* hidden parameters (like `int* returnSize`) appended to the
signature when the output is an array, since C can't return array length
information any other way. Every other language ignores this argument.

---
## 6. `getInvocation(functionCall, outputType, getDataType)` — printing the result 

This is the piece covered in depth in Section10 below, because it has its own
shared sub-architecture (`OutputCategory`, `InvocationPrinter`,
`createGetInvocation`). In one sentence: **it returns the source code that
calls `solution()` and prints whatever it returns**, formatted correctly
based on whether the output is a primitive, a char, an array, or a 2D
array.

```ts
getInvocation('solution(5,3)', 'int', getLanguageDataType);
// -> 'int value = solution(5,3); cout<<"<logsOutputSeprator>"<<value;'
```

---

## 7. `formatInvocationArgument(param, value)` — optional, for named-argument languages

```ts
// swift only:
formatInvocationArgument: (param, value) => `${param.paramName}: ${value}`,
```

**What it's for:** most languages call functions positionally —
`solution(5, 3)`. Swift requires (or strongly prefers) labeled arguments —
`solution(n: 5, nums: [1,2,3])`. This optional hook lets a language wrap
each already-formatted argument with its parameter name before the final
call string is assembled. Only Swift currently uses it; every other
language can omit this field entirely and the default (positional) call
format is used.

---

## 8. `buildWrapper(wrapper, question)` — optional, for wrapper templates that need question-specific info

```ts
// erlang only:
buildWrapper: (wrapper, question) => {
  return wrapper.replace("ARITY", String(question.inputType.length));
}
```

**What it's for:** Erlang's module/export declarations need to state the
function's *arity* (number of arguments) up front — something that depends
on the specific question being solved, not just the language. This hook
lets a language post-process its static `wrapper` string with per-question
details before it's used. Most languages don't need this because their
wrapper boilerplate doesn't depend on the question — only Erlang currently
implements it.

---

## 9. `buildInvocation(inputTypes, testCaseInput, outputType, testCaseOutput?)` — optional, full override for complex languages

```ts
// c only — heavily simplified shape:
buildInvocation: (inputTypes, testCaseInput, outputType, testCaseOutput) => {
  // build variable declarations for arrays (C has no array literals
  // the way C++/Java do), then build the function call, then print
  // the result based on outputType.
  return `${declarations}\n${functionCall};`;
}
```

**What it's for:** this is an "escape hatch for the entire invocation
process," not just printing. C is the only language that currently needs
it, because C can't express things like `vector<int>{1,2,3}` as an inline
literal — arrays have to be declared as separate named variables first
(`int nums[] = {1,2,3};`), and the function call needs extra
size/return-size parameters threaded through. When `buildInvocation` is
present, it's used **instead of** the `formatArgument` +
`formatParameters` + `getInvocation` pipeline for that language, because
the whole thing needs to be built together as one unit.

If you're not building a language as structurally unusual as C, you
probably don't need this hook — prefer `formatArgument` +
`getInvocation` (built via `createGetInvocation`, see below).

---

## 10. The output-printing sub-architecture (used by `getInvocation`)

### 10.1 Why this needed its own design

Printing an `int` is simple in every language, but printing an `array`
needs a loop, and a `2D array` needs a nested loop. Originally, every
language's `getInvocation` re-implemented the same "what shape is this
output" branching inline, with only the print syntax differing:

```ts
// cpp (old)
getInvocation: (call, outType, getDT) => {
  if (outType === 'array_int' || outType === 'array_char') {
    return `${getDT('cpp', outType)} arr = ${call}; cout<<"<logsOutputSeprator>"; for(...) cout<<arr[i]<<" ";`;
  }
  if (outType === 'char') {
    return `char value = ${call}; cout<<"<logsOutputSeprator>"<<value;`;
  }
  return `${getDT('cpp', outType)} value = ${call}; cout<<"<logsOutputSeprator>"<<value;`;
}
```

That branching logic was copy-pasted across ~15 languages. We split it into
two separate concerns:

| Question | Answered by | Written... |
|---|---|---|
| "What shape is this output?" | `getOutputCategory()` | **once**, shared by every language |
| "How does this language print that shape?" | each language's `InvocationPrinter` | once per language, just the printing code |

Same C++ example, rewritten:

```ts
getInvocation: createGetInvocation({
  array: (call, outType, getDT) =>
    `${getDT('cpp', outType)} arr = ${call}; cout<<"<logsOutputSeprator>"; for(...) cout<<arr[i]<<" ";`,
  char: (call) =>
    `char value = ${call}; cout<<"<logsOutputSeprator>"<<value;`,
  primitive: (call, outType, getDT) =>
    `${getDT('cpp', outType)} value = ${call}; cout<<"<logsOutputSeprator>"<<value;`,
})
```

No `if (outType === ...)` anywhere — C++ only describes *what to print*,
not *when*.

### 10.2 `OutputCategory` — naming the 5 possible "shapes"

```ts
export const OutputCategory = {
  Primitive: 'primitive',
  String: 'string',
  Char: 'char',
  Array: 'array',
  TwoDArray: '2d_array',
} as const;
```

A fixed list of output shapes, written as an object (not raw strings) so
TypeScript catches typos at compile time instead of letting them fail
silently at runtime.

### 10.3 `getOutputCategory(outType)` — "what shape is this?"

```ts
getOutputCategory('array_int');      // -> 'array'
getOutputCategory('2d_array_char');  // -> '2d_array'
getOutputCategory('char');           // -> 'char'
getOutputCategory('int');            // -> 'primitive'
```

The **only** place in the file that knows our type-naming convention. Add
a new naming convention once here, every language benefits automatically.

### 10.4 `InvocationPrinter` — "how do I print each shape?"

```ts
interface InvocationPrinter {
  primitive: InvocationHandler;   // REQUIRED — default for int/float/boolean/etc.
  string?: InvocationHandler;     // optional
  char?: InvocationHandler;       // optional
  array?: InvocationHandler;      // optional
  twoDArray?: InvocationHandler;  // optional
  types?: Partial<Record<string, InvocationHandler>>; // rare escape hatch
  transformCall?: (call: string) => string;           // rare, rewrites the call string first
}
```

If a category field (e.g. `array`) is omitted, that shape just falls back
to `primitive` — meaning "this language doesn't special-case it," matching
each language's original behavior exactly.

`types` is for the rare case where two outputs in the *same category*
genuinely need different code (e.g. Erlang prints `array_int` with `~p`
but `array_char` with `~c`). Use it sparingly — only when category-level
handlers can't express the difference.

### 10.5 `createGetInvocation(printer)` — wiring it together

The one function, written once, that does the actual decision-making:

```
1. Exact match in `types[outType]`?           -> use it
2. Category handler for getOutputCategory()?  -> use it
3. Otherwise                                  -> use `primitive`
```

### 10.6 Cheat sheet: adding a new language's output printing

1. Same print logic for every shape? → only `primitive`.
2. Arrays need a loop? → add `array`.
3. 2D arrays need nested loops? → add `twoDArray`.
4. `char` needs special quoting/format specifiers? → add `char`.
5. One exact type breaks from its category (e.g. booleans need
   `"true"`/`"false"`)? → add it under `types`.
6. Call string needs rewriting first (namespacing, etc.)? → add
   `transformCall`.

---

## 11. The two exported lookup functions

```ts
export const getLanguageConfig = (language: string): LanguageConfig => { ... }
export function getLanguageDataType(language: string, paramType: string): string { ... }
```

- `getLanguageConfig('java')` — returns the full `LanguageConfig` object
  for a language, or throws if it's not registered. This is the main entry
  point the rest of the codebase uses to get at everything described above.
- `getLanguageDataType('cpp', 'array_int')` — looks up a type name from
  `dataTypeMap`, with a small hardcoded fallback for C's pointer types
  (`int**`, `int*`, `char*`) that aren't expressed as plain map entries.

These two functions are untouched by this refactor — same signatures, same
behavior.

---

## 12. End-to-end example: tracing one full submission

Say a user submits a C++ solution for a problem with one `int` parameter
`n`, returning an `int`, and the test case is `n = 5`.

1. `formatArgument('int', 5)` → `"5"`
2. `formatParameters([{type:'int', paramName:'n'}], getLanguageDataType)`
   → `"int n"` (used for the function signature shown to the user)
3. The function call string is assembled: `"solution(5)"`
4. `getInvocation("solution(5)", "int", getLanguageDataType)` →
   `'int value = solution(5); cout<<"<logsOutputSeprator>"<<value;'`
5. That string gets inserted into `wrapper`/`template`, producing a full
   `.cpp` file.
6. The file is compiled and run; we read whatever printed after
   `<logsOutputSeprator>` and compare it to the expected output.

Every field in `LanguageConfig` exists to make one of these numbered steps
possible for a given language.

---