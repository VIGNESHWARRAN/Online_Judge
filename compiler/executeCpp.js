const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

const outputPath = path.join(__dirname, 'outputs');

// Ensure output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and runs C++ code with given input, handles timeout, captures output & errors.
 * 
 * @param {string} filepath - Path to the C++ source file (.cpp)
 * @param {string} input - Input string to be passed to program stdin
 * @param {number} timeoutMs - Timeout in milliseconds (default 5000)
 * @returns {Promise<object>} Resolves with {output} or {error, detail}
 */
const executeCpp = (filepath, input = '', timeoutMs = 5000) => {
  const jobID = path.basename(filepath, path.extname(filepath));
  const outFile = path.join(outputPath, `${jobID}.out`);

  // Use .exe extension for Windows executables
  const executableName = process.platform === 'win32' ? `${jobID}.exe` : jobID;
  const executablePath = path.join(outputPath, executableName);

  return new Promise((resolve) => {
    // Step 1: Compile the source file
    const compile = spawn('g++', [filepath, '-o', executablePath]);

    let compileErrors = '';

    compile.stderr.on('data', (data) => {
      compileErrors += data.toString();
    });

    compile.on('close', (code) => {
      if (code !== 0) {
        // Compilation failed
        fs.writeFileSync(outFile, `Compilation Error:\n${compileErrors.trim()}`);
        return resolve({ error: 'Compilation Failed', detail: compileErrors.trim() });
      }

      // Step 2: Run the compiled executable
      // On Windows, use shell to resolve .exe properly
      const runOptions = process.platform === 'win32' ? { shell: true } : {};
      const run = spawn(executablePath, [], runOptions);

      let stdout = '';
      let stderr = '';
      let isTimeout = false;

      const timeout = setTimeout(() => {
        isTimeout = true;
        run.kill('SIGKILL'); // Force kill process on timeout
        fs.writeFileSync(outFile, 'Time Limit Exceeded');
        return resolve({ error: 'Time Limit Exceeded' });
      }, timeoutMs);

      if (input) {
        run.stdin.write(input);
      }
      run.stdin.end();

      run.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      run.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      run.on('close', (exitCode) => {
        clearTimeout(timeout);
        if (isTimeout) return;

        if (exitCode !== 0) {
          fs.writeFileSync(outFile, `Runtime Error:\n${stderr.trim()}`);
          return resolve({ error: 'Runtime Error', detail: stderr.trim() });
        } else {
          fs.writeFileSync(outFile, stdout.trim());
          return resolve({ output: stdout.trim() });
        }
      });

      run.on('error', (err) => {
        clearTimeout(timeout);
        fs.writeFileSync(outFile, `Execution Failed:\n${err.message}`);
        return resolve({ error: 'Execution Failed', detail: err.message });
      });
    });

    compile.on('error', (err) => {
      fs.writeFileSync(outFile, `Compilation Failed:\n${err.message}`);
      return resolve({ error: 'Compilation Failed', detail: err.message });
    });
  });
};

module.exports = { executeCpp };
