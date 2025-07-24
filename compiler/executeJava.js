const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = async (jobId, code) => {
  const fileName = `${jobId}.java`;
  const filePath = path.join(outputPath, fileName);
  const outPath = path.join(outputPath, `${jobId}.out`);
  let timedOut = false;

  return new Promise((resolve) => {
    const compile = spawn('javac', [filePath]);

    let compileError = '';

    compile.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    compile.on('close', (compileCode) => {
      if (compileCode !== 0) {
        fs.writeFileSync(outPath, `Java Compilation Error:\n${compileError.trim()}`);
        return resolve({ error: "Java Compilation Failed", detail: compileError });
      }

      const run = spawn('java', ['-cp', outputPath, jobId]); // ✅ specify output dir in cp

      let output = '';
      let errorOutput = '';

      const timeout = setTimeout(() => {
        timedOut = true;
        run.kill();
        fs.writeFileSync(outPath, "Time Limit Exceeded");
        return resolve({ error: "Time Limit Exceeded" });
      }, 5000);

      run.stdout.on('data', (data) => {
        output += data.toString();
      });

      run.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      run.on('close', (code) => {
        clearTimeout(timeout);
        if (timedOut) return;

        if (code !== 0) {
          fs.writeFileSync(outPath, `Java Error: ${errorOutput}`);
          return resolve({ error: errorOutput });
        } else {
          fs.writeFileSync(outPath, output.trim());
          return resolve({ output: output.trim() });
        }
      });
    });
  });
};

module.exports = { executeJava };
