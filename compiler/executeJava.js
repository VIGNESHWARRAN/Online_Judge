const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the output directory exists
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const javaCompilerPath = 'javac';
const javaRuntimePath = 'java';

const executeJava = async (filepath) => {
    const absolutePath = path.resolve(filepath); // ✅ Resolve full path
    const jobID = path.parse(absolutePath).name; // ✅ Extract base name
    const classDir = path.dirname(absolutePath); // ✅ Classpath
    const className = path.basename(absolutePath, '.java');
    const outPath = path.join(outputPath, `${jobID}.out`);
    let timedOut = false;

    return new Promise((resolve) => {
        // 🔧 Compile Java file
        const compile = spawn(javaCompilerPath, [absolutePath], { cwd: classDir });

        let compileError = '';

        compile.stderr.on('data', (data) => {
            compileError += data.toString();
        });

        compile.on('close', (compileCode) => {
            if (compileCode !== 0) {
                fs.writeFileSync(outPath, `Java Compilation Error:\n${compileError.trim()}`);
                return resolve({ error: "Java Compilation Failed", detail: compileError });
            }

            // ▶️ Run Java compiled class
            const run = spawn(javaRuntimePath, ['-cp', classDir, className]);

            let output = '';
            let errorOutput = '';

            const timeout = setTimeout(() => {
                timedOut = true;
                console.error("⏳ Java Process Timeout: Possible Infinite Loop");
                run.kill();
                const timeoutMessage = "Time Limit Exceeded";
                fs.writeFileSync(outPath, timeoutMessage);
                return resolve({ error: "Java Runtime Error: Time Limit Exceeded" });
            }, 5000);

            run.stdout.on('data', (data) => {
                output += data.toString();
            });

            run.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            run.on('close', (code) => {
                clearTimeout(timeout);

                if (timedOut) return; // Avoid re-resolving

                if (code !== 0) {
                    const error = extractJavaErrorType(errorOutput);
                    fs.writeFileSync(outPath, `Java Error: ${error}`);
                    return resolve({ error: `Java Error: ${error}`, detail: errorOutput });
                } else {
                    fs.writeFileSync(outPath, output.trim());
                    return resolve({ output: output.trim() });
                }
            });

            run.on('error', (err) => {
                clearTimeout(timeout);
                if (timedOut) return;
                const errorMsg = `Java Execution Failed: ${err.message}`;
                fs.writeFileSync(outPath, errorMsg);
                return resolve({ error: errorMsg });
            });
        });

        compile.on('error', (err) => {
            const errorMsg = `Java Compilation Error: ${err.message}`;
            fs.writeFileSync(outPath, errorMsg);
            return resolve({ error: errorMsg });
        });
    });
};

function extractJavaErrorType(errorOutput) {
    if (!errorOutput) return 'Unknown Error';
    const lines = errorOutput.split('\n').map(line => line.trim()).filter(Boolean);
    const firstExceptionLine = lines.find(line => line.startsWith('Exception in')) || lines.find(line => line.includes('Exception'));

    if (firstExceptionLine && firstExceptionLine.includes(':')) {
        return firstExceptionLine.split(':')[0].trim(); // e.g., java.lang.NullPointerException
    }

    return lines[0] || 'Unknown Java Error';
}

module.exports = {
    executeJava
};
