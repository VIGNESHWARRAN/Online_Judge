const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = async (filepath, input = '', timeoutMs = 5000) => {
  const jobID = path.basename(filepath).split('.')[0];
  const outPath = path.join(outputPath, `${jobID}.out`);

  return new Promise((resolve) => {
    const startTime = performance.now();
    let timedOut = false;
    let output = '';
    let errorOutput = '';

    // Spawn Java process with source file path
    const javaProcess = spawn('java', [filepath]);

    // Timeout to kill long-running process
    const timeout = setTimeout(() => {
      timedOut = true;
      javaProcess.kill();
      fs.writeFileSync(outPath, 'Time Limit Exceeded');
      resolve({ error: 'Time Limit Exceeded' });
    }, timeoutMs);

    // Write input if provided
    if (input) {
      javaProcess.stdin.write(input);
    }
    javaProcess.stdin.end();

    javaProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    javaProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    javaProcess.on('close', (code) => {
      clearTimeout(timeout);

      if (timedOut) {
        return;
      }

      const endTime = performance.now();
      const execTimeMs = +(endTime - startTime).toFixed(2);

      const memUsageKB = process.memoryUsage().rss / 1024; // Approximate resident set size in KB

      if (code !== 0) {
        fs.writeFileSync(outPath, `Java runtime error:\n${errorOutput.trim()}`);
        resolve({
          error: 'Java runtime error',
          detail: errorOutput.trim(),
          time: execTimeMs,
          memory: memUsageKB,
        });
      } else {
        fs.writeFileSync(outPath, output.trim());
        resolve({
          output: output.trim(),
          time: execTimeMs,
          memory: memUsageKB,
        });
      }
    });

    javaProcess.on('error', (err) => {
      clearTimeout(timeout);
      fs.writeFileSync(outPath, `Error executing Java process:\n${err.message}`);
      resolve({
        error: 'Error executing Java process',
        detail: err.message,
      });
    });
  });
};

module.exports = { executeJava };
