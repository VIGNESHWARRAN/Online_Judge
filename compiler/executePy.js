const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const outputPath = path.join(__dirname, 'outputs');

// Ensure output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Executes a Python script with optional input sent to stdin.
 * - If input is empty or undefined, no input is sent, suitable for programs with no input() call.
 * - Enforces a 5-second timeout.
 * 
 * @param {string} filepath - Absolute path to the Python script 
 * @param {string} input - String input for stdin; default is empty string.
 * @param {number} timeoutMs - Milliseconds timeout for execution; default 5000.
 * @returns {Promise<object>} Resolves with:
 *  - { output, time, memory } on success,
 *  - { error, detail, time, memory } on failure
 */
const executePy = async (filepath, input = '', timeoutMs = 5000) => {
  const jobId = path.basename(filepath).split('.')[0];
  const outFile = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve) => {
    const startTime = performance.now();
    let timedOut = false;

    // Spawn Python process
    const pyProcess = spawn('python', [filepath]);

    let stdoutData = '';
    let stderrData = '';

    // Setup timeout
    const timeout = setTimeout(() => {
      timedOut = true;
      pyProcess.kill();
      const timeoutMessage = 'Time Limit Exceeded';
      fs.writeFileSync(outFile, timeoutMessage);
      resolve({ error: 'Time Limit Exceeded' });
    }, timeoutMs);

    // Write input to stdin if provided, otherwise close immediately
    if (input) {
      pyProcess.stdin.write(input);
    }
    pyProcess.stdin.end();

    // Collect stdout
    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Collect stderr
    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // Process termination handler
    pyProcess.on('close', (exitCode) => {
      clearTimeout(timeout);

      // Calculate execution time
      const endTime = performance.now();
      const timeTaken = +(endTime - startTime).toFixed(2);

      // Process memory usage (resident set size in KB)
      const resourceUsage = process.resourceUsage();
      const memoryUsedKb = resourceUsage.rss / 1024;

      // If killed due to timeout, already resolved
      if (timedOut) return;

      if (exitCode !== 0) {
        // Extract main error type for cleaner reporting
        const errorType = extractPythonErrorType(stderrData);
        const fullErrorMsg = `Python Error: ${errorType}`;

        // Write full stderr to output file for debugging
        fs.writeFileSync(outFile, fullErrorMsg + '\n\n' + stderrData.trim());

        resolve({
          error: fullErrorMsg,
          detail: stderrData.trim(),
          time: timeTaken,
          memory: memoryUsedKb,
        });
      } else {
        // Write stdout to output file
        fs.writeFileSync(outFile, stdoutData.trim());

        resolve({
          output: stdoutData.trim(),
          time: timeTaken,
          memory: memoryUsedKb,
        });
      }
    });

    // Error handler if spawning failed
    pyProcess.on('error', (err) => {
      clearTimeout(timeout);
      const errMsg = `Failed to start Python process: ${err.message}`;
      fs.writeFileSync(outFile, errMsg);
      resolve({ error: errMsg });
    });
  });
};

/**
 * Extracts the Python error type from stderr content.
 * @param {string} stderrData - Standard error string from Python execution.
 * @returns {string} Error type or "Unknown Python Error".
 */
function extractPythonErrorType(stderrData) {
  if (!stderrData) return 'Unknown Python Error';
  const lines = stderrData.trim().split('\n');
  // Try to get last meaningful line
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line) {
      if (line.includes(':')) {
        return line.split(':')[0];
      }
      return line;
    }
  }
  return 'Unknown Python Error';
}

module.exports = {
  executePy,
};
