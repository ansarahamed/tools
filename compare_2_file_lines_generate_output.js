//This would generate file comparison
//This was used to compare indexes between 2 environments
//Also, it was used to generate common lines between files.


//I was given task to compare 2 databases from different env.
//Basically output of the command
//SHOW INDEXES FROM DATABASE <DBNAME>;
// Used Negative look ahead to trim spaces except new line

const fs = require('fs');
const readline = require('readline');

// Function to read file line by line and store lines with their line numbers
function readFileLinesWithNumbers(filePath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        const lines = new Map(); // Use a Map to store line numbers and content
        let lineNumber = 1;

        rl.on('line', (line) => {
            lines.set(line.trim(), lineNumber);
            lineNumber++;
        });

        rl.on('close', () => {
            resolve(lines);
        });

        rl.on('error', (err) => {
            reject(err);
        });
    });
}

async function compareFiles(file1, file2) {
    try {
        // Read both files with line numbers
        const [linesFile1, linesFile2] = await Promise.all([
            readFileLinesWithNumbers(file1),
            readFileLinesWithNumbers(file2),
        ]);

        // Find unique lines in file1
        const uniqueInFile1 = [...linesFile1.keys()].filter(line => !linesFile2.has(line));
        // Find unique lines in file2
        const uniqueInFile2 = [...linesFile2.keys()].filter(line => !linesFile1.has(line));
        // Find common lines
        const commonLines = [...linesFile1.keys()].filter(line => linesFile2.has(line));

        // Display unique lines from file1 with line numbers
        if (uniqueInFile1.length > 0) {
            console.log(`Unique lines in ${file1}:`);
            uniqueInFile1.forEach(line => {
                console.log(`Line ${linesFile1.get(line)}: ${line}`);
            });
        } else {
            console.log(`No unique lines found in ${file1}.`);
        }

        console.log(); // Empty line for separation

        // Display unique lines from file2 with line numbers
        if (uniqueInFile2.length > 0) {
            console.log(`Unique lines in ${file2}:`);
            uniqueInFile2.forEach(line => {
                console.log(`Line ${linesFile2.get(line)}: ${line}`);
            });
        } else {
            console.log(`No unique lines found in ${file2}.`);
        }

        console.log(); // Empty line for separation

        // Display common lines with line numbers from both files
        if (commonLines.length > 0) {
            console.log('Common lines:');
            commonLines.forEach(line => {
                console.log(`File1 Line ${linesFile1.get(line)}: ${line}`);
                console.log(`File2 Line ${linesFile2.get(line)}: ${line}`);
            });
        } else {
            console.log('No common lines found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Get file paths from command-line arguments
const file1Path = process.argv[2];
const file2Path = process.argv[3];

// Check if both file paths are provided
if (!file1Path || !file2Path) {
    console.error('Please provide paths to two files.');
    console.error('Usage: node compareFiles.js <file1> <file2>');
    process.exit(1);
}

// Run the comparison
compareFiles(file1Path, file2Path);

