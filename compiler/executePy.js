const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputPath = path.join(__dirname, "outputs");

if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath, {recursive: true});
}
const executePy = async (filepath) => {
    const jobID = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobID}.out`);
    let timedOut = false;

    return new Promise((resolve) => {
        const pyProcess = spawn('python', [filepath]);

        let output = '';
        let errorOutput = '';
        const timeout = setTimeout(() => {
            timedOut = true;
            console.error("⏳ Python Process Timeout: Possible Infinite Loop");
            pyProcess.kill();
            const timeoutMessage = "Time Limit Exceeded";
            fs.writeFileSync(outPath, timeoutMessage);
            resolve({ error: "Python Runtime Error: Time Limit Exceeded" });
        }, 5000);

        pyProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pyProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pyProcess.on('close', (code) => {
            clearTimeout(timeout);

            if (timedOut) {return};
            if (code !== 0) {
                const extractedError = extractPythonErrorType(errorOutput);
                const fullError = `Python Error: ${extractedError}`; //Python Error: ${extractedError}\n\nDetails:\n${errorOutput}
                fs.writeFileSync(outPath, fullError);
                return resolve({ error: `Python Error: ${extractedError}`, detail: errorOutput });
            } else {
                fs.writeFileSync(outPath, output.trim());
                return resolve({ output: output.trim() });
            }
        });
        pyProcess.on('error', (err) => {
            clearTimeout(timeout);
            console.error("Python Execution Error:", err);
            const errorMsg = `Python Execution Failed: ${err.message}`;
            fs.writeFileSync(outPath, errorMsg);
            return resolve({ error: errorMsg });
        });
    });
};

function extractPythonErrorType(errorOutput) {
    if (!errorOutput) return "Unknown Error";
    const errorLines = errorOutput.trim().split("\n");
    const lastLine = errorLines[errorLines.length - 1];
    if (lastLine.includes(":")) {
        return lastLine.split(":")[0].trim();
    }
    return "Unknown Python Error";
}

module.exports = {
    executePy,
};