const { spawn } = require('child_process');
const path = require('path');
const { performance } = require('perf_hooks');

function parseJavaCompileError(errorOutput) {
    const lines = errorOutput.split('\n');
    const firstLine = lines.find(line => line.includes('error:')) || lines[0];

    if (/';' expected/.test(firstLine)) {
        return "Java Syntax Error";
    } else if (/cannot find symbol/.test(firstLine)) {
        return "Java Symbol Not Found Error";
    } else if (/incompatible types/.test(firstLine)) {
        return "Java Type Mismatch Error";
    } else if (/missing return statement/.test(firstLine)) {
        return "Java Missing Return Statement Error";
    } else if (/has private access/.test(firstLine)) {
        return "Java Access Control Error";
    } else if (/is already defined/.test(firstLine)) {
        return "Java Duplicate Definition Error";
    } else if (/unreachable statement/.test(firstLine)) {
        return "Java Unreachable Code Error";
    } else if (/package .* does not exist/.test(firstLine)) {
        return "Java Package Not Found Error";
    }
    return null;
}

function parseJavaRuntimeError(errorOutput) {
    // --- Standard Runtime Errors ---
    if (/java\.lang\.StringIndexOutOfBoundsException/.test(errorOutput)) {
        return "Java String Index Out Of Bounds Exception";
    } else if (/java\.lang\.ArrayIndexOutOfBoundsException/.test(errorOutput)) {
        return "Java Array Index Out Of Bounds Exception";
    } else if (/java\.lang\.IndexOutOfBoundsException/.test(errorOutput)) {
        return "Java Index Out Of Bounds Exception";
    } else if (/java\.lang\.NullPointerException/.test(errorOutput)) {
        return "Java Null Pointer Exception";
    } else if (/java\.lang\.ArrayStoreException/.test(errorOutput)) {
        return "Java Array Store Exception";
    } else if (/java\.lang\.NegativeArraySizeException/.test(errorOutput)) {
        return "Java Negative Array Size Exception";
    } else if (/java\.util\.EmptyStackException/.test(errorOutput)) {
        return "Java Empty Stack Exception";
    } else if (/java\.lang\.ClassCastException/.test(errorOutput)) {
        return "Java Class Cast Exception";
    } else if (/java\.lang\.ArithmeticException/.test(errorOutput)) {
        return "Java Arithmetic Exception";
    } else if (/java\.lang\.NumberFormatException/.test(errorOutput)) {
        return "Java Number Format Exception";
    } else if (/java\.lang\.IllegalArgumentException/.test(errorOutput)) {
        return "Java Illegal Argument Exception";
    } else if (/java\.lang\.IllegalStateException/.test(errorOutput)) {
        return "Java Illegal State Exception";
    } else if (/java\.lang\.UnsupportedOperationException/.test(errorOutput)) {
        return "Java Unsupported Operation Exception";
    } else if (/java\.util\.ConcurrentModificationException/.test(errorOutput)) {
        return "Java Concurrent Modification Exception";
    } 
    
    // --- Reflection & Loading Errors ---
    else if (/java\.lang\.ClassNotFoundException/.test(errorOutput)) {
        return "Java Class Not Found Exception";
    } else if (/java\.lang\.NoClassDefFoundError/.test(errorOutput)) {
        return "Java No Class Def Found Error";
    } else if (/java\.lang\.NoSuchMethodException/.test(errorOutput)) {
        return "Java No Such Method Exception";
    } else if (/java\.lang\.NoSuchFieldException/.test(errorOutput)) {
        return "Java No Such Field Exception";
    } else if (/java\.lang\.InstantiationException/.test(errorOutput)) {
        return "Java Instantiation Exception";
    } else if (/java\.lang\.TypeNotPresentException/.test(errorOutput)) {
        return "Java Type Not Present Exception";
    } else if (/java\.lang\.ReflectiveOperationException/.test(errorOutput)) {
        return "Java Reflective Operation Exception";
    }

    // --- System & IO Errors ---
    else if (/java\.lang\.StackOverflowError/.test(errorOutput)) {
        return "Java Stack Overflow Error";
    } else if (/java\.lang\.OutOfMemoryError/.test(errorOutput)) {
        return "Java Out Of Memory Error";
    } else if (/java\.io\.FileNotFoundException/.test(errorOutput)) {
        return "Java File Not Found Exception";
    } else if (/java\.io\.IOException/.test(errorOutput)) {
        return "Java IO Exception";
    } else if (/java\.lang\.InterruptedException/.test(errorOutput)) {
        return "Java Interrupted Exception";
    } else if (/java\.util\.concurrent\.TimeoutException/.test(errorOutput)) {
        return "Java Timeout Exception";
    } else if (/java\.lang\.SecurityException/.test(errorOutput)) {
        return "Java Security Exception";
    } else if (/java\.lang\.AssertionError/.test(errorOutput)) {
        return "Java Assertion Error";
    }
    
    return null;
}

function parseJavaLinkageError(errorOutput) {
    if (/java\.lang\.NoClassDefFoundError/.test(errorOutput)) {
        return "Java No Class Definition Found Error";
    } else if (/java\.lang\.UnsatisfiedLinkError/.test(errorOutput)) {
        return "Java Unsatisfied Link Error";
    } else if (/java\.lang\.VerifyError/.test(errorOutput)) {
        return "Java Verify Error";
    }
    return null;
}


/**
 * Executes a compiled Java program.
 * @param {string} filepath - Path to the compiled Java class file (no extension).
 * @param {string} input - Optional string input to feed program's stdin.
 * @param {number} timeoutMs - Max execution time in milliseconds (default 5000ms).
 * @returns {Promise<object>} Resolves with output, time, memory or error info.
 */
const executeJava = (filepath, input = '', timeoutMs = 5000) => {
    let output = '';
    let errorOutput = '';

    const workingDir = path.dirname(filepath);
    const className = path.basename(filepath);

    return new Promise((resolve) => {
        const startTime = performance.now();
        let timedOut = false;

        const javaProcess = spawn('java', ['-cp', workingDir, className], {
            cwd: workingDir,
            shell: true,
        });

        const timeout = setTimeout(() => {
            timedOut = true;
            javaProcess.kill('SIGKILL');
            resolve({ error: 'Time Limit Exceeded' });
        }, timeoutMs);

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
            if (timedOut) return;

            const endTime = performance.now();
            const execTime = +(endTime - startTime).toFixed(2);
            const memUsageKb = process.memoryUsage().rss / 1024;

            if (code !== 0) {
                let parsedError = null;

                if (/error:/i.test(errorOutput)) {
                    parsedError = parseJavaCompileError(errorOutput);
                } else if (/Exception|Error/.test(errorOutput)) {
                    if (/NoClassDefFoundError|UnsatisfiedLinkError|VerifyError/.test(errorOutput)) {
                        parsedError = parseJavaLinkageError(errorOutput);
                    }
                    if (!parsedError) {
                        parsedError = parseJavaRuntimeError(errorOutput);
                    }
                }

                if (!parsedError) {
                    parsedError = "Unknown Error";
                }

                resolve({
                    error: parsedError,
                    detail: errorOutput.trim(),
                    time: execTime,
                    memory: memUsageKb,
                });
            } else {
                resolve({
                    output: output.trim(),
                    time: execTime,
                    memory: memUsageKb,
                });
            }
        });

        javaProcess.on('error', (err) => {
            clearTimeout(timeout);
            resolve({
                error: 'Unknown Error',
                detail: err.message,
            });
        });
    });
};


module.exports = { executeJava };