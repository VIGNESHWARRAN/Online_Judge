const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

const executePy = async (filepath, input = '', timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let timedOut = false;

    const pyProcess = spawn('python', [filepath]);

    let stdoutData = '';
    let stderrData = '';

    const timeout = setTimeout(() => {
      timedOut = true;
      pyProcess.kill();
      resolve({ error: 'Time Limit Exceeded' });
    }, timeoutMs);

    // Send input if any, or close stdin immediately
    if (input) {
      pyProcess.stdin.write(input);
    }
    pyProcess.stdin.end();

    // Capture stdout
    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Capture stderr
    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // On process exit
    pyProcess.on('close', (exitCode) => {
      clearTimeout(timeout);

      const endTime = performance.now();
      const timeTaken = +(endTime - startTime).toFixed(2);

      // Approximate memory usage (resident set size in KB)
      // Note: resourceUsage is available in newer Node versions; fallback to memoryUsage if needed
      const resourceUsage = process.resourceUsage ? process.resourceUsage() : process.memoryUsage();
      const memoryUsedKb = resourceUsage.rss / 1024;

      if (timedOut) return; // Already resolved on timeout

      if (exitCode !== 0) {
        const errorType = parsePythonError(stderrData);
        resolve({
          error: errorType,
          detail: stderrData.trim(),
          time: timeTaken,
          memory: memoryUsedKb,
        });
      } else {
        resolve({
          output: stdoutData.trim(),
          time: timeTaken,
          memory: memoryUsedKb,
        });
      }
    });

    // Handle spawn errors (like process not starting)
    pyProcess.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ error: 'Unknown Error', detail: err.message });
    });
  });
};

function parsePythonError(stderrData) {
  if (!stderrData) return 'Unknown Error';

  const lines = stderrData.trim().split('\n');
  const lastLine = lines[lines.length - 1].trim(); 

  // Extract just error type before colon, if available
  const errorType = lastLine.includes(':') ? lastLine.split(':')[0].trim() : lastLine;

  // --- SYNTAX & INDENTATION ---
  if (/SyntaxError/.test(errorType)) {
    return 'Python Syntax Error';
  } else if (/IndentationError/.test(errorType)) {
    return 'Python Indentation Error';
  } else if (/TabError/.test(errorType)) {
    return 'Python Tab Error';
  
  // --- VARIABLES & LOOKUP ---
  } else if (/NameError/.test(errorType)) {
    return 'Python Name Error';
  } else if (/UnboundLocalError/.test(errorType)) {
    return 'Python Unbound Local Error';
  } else if (/LookupError/.test(errorType)) {
    return 'Python Lookup Error';
  } else if (/IndexError/.test(errorType)) {
    return 'Python Index Error';
  } else if (/KeyError/.test(errorType)) {
    return 'Python Key Error';
  } else if (/AttributeError/.test(errorType)) {
    return 'Python Attribute Error';
    
  // --- TYPES & VALUES ---
  } else if (/TypeError/.test(errorType)) {
    return 'Python Type Error';
  } else if (/ValueError/.test(errorType)) {
    return 'Python Value Error';
  
  // --- MATH & NUMBERS ---
  } else if (/ZeroDivisionError/.test(errorType)) {
    return 'Python Zero Division Error';
  } else if (/ArithmeticError/.test(errorType)) {
    return 'Python Arithmetic Error';
  } else if (/OverflowError/.test(errorType)) {
    return 'Python Overflow Error';
  } else if (/FloatingPointError/.test(errorType)) {
    return 'Python Floating Point Error';

  // --- IMPORTS & FILES ---
  } else if (/ModuleNotFoundError/.test(errorType)) {
    return 'Python Module Not Found Error';
  } else if (/ImportError/.test(errorType)) {
    return 'Python Import Error';
  } else if (/FileNotFoundError/.test(errorType)) {
    return 'Python File Not Found Error';
  } else if (/PermissionError/.test(errorType)) {
    return 'Python Permission Error';

  // --- RUNTIME & MEMORY ---
  } else if (/RuntimeError/.test(errorType)) {
    return 'Python Runtime Error';
  } else if (/RecursionError/.test(errorType)) {
    return 'Python Recursion Error';
  } else if (/MemoryError/.test(errorType)) {
    return 'Python Memory Error';
  } else if (/NotImplementedError/.test(errorType)) {
    return 'Python Not Implemented Error';

  // --- ENCODING ---
  } else if (/UnicodeEncodeError/.test(errorType)) {
    return 'Python Unicode Encode Error';
  } else if (/UnicodeDecodeError/.test(errorType)) {
    return 'Python Unicode Decode Error';
  } else if (/UnicodeTranslateError/.test(errorType)) {
    return 'Python Unicode Translate Error';
  } else if (/UnicodeError/.test(errorType)) {
    return 'Python Unicode Error';

  // --- SYSTEM & CONTROL FLOW ---
  } else if (/AssertionError/.test(errorType)) {
    return 'Python Assertion Error';
  } else if (/TimeoutError/.test(errorType)) {
    return 'Python Timeout Error';
  } else if (/StopIteration/.test(errorType)) {
    return 'Python Stop Iteration Error';
  } else if (/GeneratorExit/.test(errorType)) {
    return 'Python Generator Exit Error';
  } else if (/EOFError/.test(errorType)) {
    return 'Python EOF Error';
  } else if (/KeyboardInterrupt/.test(errorType)) {
    return 'Python Keyboard Interrupt Error';
  } else if (/SystemExit/.test(errorType)) {
    return 'Python System Exit Error';

  } else {
    // Strict Fallback
    return 'Unknown Error';
  }
}

module.exports = {
  executePy,
};