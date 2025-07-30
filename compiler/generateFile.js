const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'codes');

const generateFile = async (format, content) => {
    const jobID = uuid();
    const filename = `${jobID}.${format}`;
    const filePath = path.join(dirCodes, filename);

    try {
        await fs.mkdir(dirCodes, { recursive: true }); // ensures folder exists
        await fs.writeFile(filePath, content);         // async write
        return { filepath: filePath, uuid: jobID };

    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
};

module.exports = {
    generateFile,
};
