const path = require("path");
const { executeJava } = require("./executeJava");

const runTest = async () => {
  const javaFilePath = path.join(__dirname, "test.java");

  const result = await executeJava(javaFilePath);

  if (result.output) {
    console.log("✅ Output:", result.output);
  } else {
    console.error("❌ Error:", result.error);
    if (result.detail) console.error("🔍 Detail:", result.detail);
  }
};

runTest();
