const { spawn } = require('child_process');
const path = require('path');
const { performance } = require('perf_hooks');
const fs = require('fs/promises'); // for async unlink

const outputPath = path.join(__dirname, 'outputs'); // only your submit handler writes files here

const executeCpp = (filepath, input = '', timeoutMs = 5000) => {
  const jobID = path.basename(filepath, path.extname(filepath));
  // No output file; compiled executable will be cleaned up after run

  // Use .exe extension for Windows executables
  const executableName = process.platform === 'win32' ? `${jobID}.exe` : jobID;
  const executablePath = path.join(outputPath, executableName);

  return new Promise((resolve) => {
    const startTime = performance.now();

    // Step 1: Compile the source file
    const compile = spawn('g++', [filepath, '-o', executablePath]);

    let compileErrors = '';

    compile.stderr.on('data', (data) => {
      compileErrors += data.toString();
    });

    compile.on('close', (code) => {
      if (code !== 0) {
        // Compilation failed, no files created logs needed
        return resolve({ error: 'Compilation Failed', detail: compileErrors.trim() });
      }

      // Step 2: Run the compiled executable
      const runOptions = process.platform === 'win32' ? { shell: true } : {};
      const run = spawn(executablePath, [], runOptions);

      let stdout = '';
      let stderr = '';
      let isTimeout = false;

      const timeout = setTimeout(() => {
        isTimeout = true;
        run.kill('SIGKILL');
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

      run.on('close', async (exitCode) => {
        clearTimeout(timeout);
        if (isTimeout) return;

        const endTime = performance.now();
        const timeTaken = +(endTime - startTime).toFixed(2);

        const resourceUsage = process.resourceUsage();
        const memoryUsedKb = resourceUsage.rss / 1024;

        // Cleanup compiled executable file
        try {
          await fs.unlink(executablePath);
        } catch (e) {
          console.error("Failed to delete executable:", executablePath, e);
        }

        if (exitCode !== 0) {
          return resolve({ error: 'Runtime Error', detail: stderr.trim(), time: timeTaken, memory: memoryUsedKb });
        } else {
          return resolve({ output: stdout.trim(), time: timeTaken, memory: memoryUsedKb });
        }
      });

      run.on('error', (err) => {
        clearTimeout(timeout);
        return resolve({ error: 'Execution Failed', detail: err.message });
      });
    });

    compile.on('error', (err) => {
      return resolve({ error: 'Compilation Failed', detail: err.message });
    });
  });
};

module.exports = { executeCpp };
