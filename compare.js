#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Get the JSON file path of previos and current report from the command-line arguments to compare
let previousJsonFilePath = process.argv[2];
let currentJsonFilePath = process.argv[3];

const outputFileName = 'coverage-json-compared.json'
let files = []
let changedFiles = []
let coverageChanged = false

if (!outputFileName) {
  console.error('Error: No output file name provided.');
  process.exit(1);
}

if (!fs.existsSync(previousJsonFilePath)) {
  console.error(`Error: The file ${jsonFilePath} does not exist.`);
  process.exit(1); 
}

if (!fs.existsSync(currentJsonFilePath)) {
  console.error(`Error: The file ${jsonFilePath} does not exist.`);
  process.exit(1); 
}

/**
 * Reads coverage-json formatted file
 * @param {*} filePath path to formatted file 
 * @returns 
 */
function readCoverage(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** Compares previous and current coverage-json files
 * @param {*} previous path to previous coverage-json file 
 * @param {*} current path to current coverage-json file 
* @returns array of object containing files that has changes in coverage
 */
function compareCoverage(previous, current) {
  current.forEach((currentFile) => {
      const previousFile = previous.find((file) => file.fileName === currentFile.fileName);

      if (previousFile) {
        const diff = {
          statementsPercentage: currentFile.statementsPercentage,
          statementsPercentageDiff: parseFloat(currentFile.statementsPercentage) - parseFloat(previousFile.statementsPercentage),
          branchesPercentage: currentFile.branchesPercentage,
          branchesPercentageDiff: parseFloat(currentFile.branchesPercentage) - parseFloat(previousFile.branchesPercentage),
          functionsPercentage: currentFile.functionsPercentage,
          functionsPercentageDiff: parseFloat(currentFile.functionsPercentage) - parseFloat(previousFile.functionsPercentage),
          linesPercentage: currentFile.linesPercentage,
          linesPercentageDiff: parseFloat(currentFile.linesPercentage) - parseFloat(previousFile.linesPercentage),
        };
        
        let hasChanges = false;
        for (const [_, value] of Object.entries(diff)) {
          if(value !== 0 && typeof value === 'number') {
            hasChanges = true;
          }
        }
        files.push({ fileName: currentFile.fileName, hasChanges: hasChanges, diff });

        changedFiles = files.filter((file) => file.hasChanges == true);
      }
    })
    return changedFiles;
}

/** Main execution */

// Read json files
previousJsonFilePath = readCoverage(previousJsonFilePath);
currentJsonFilePath = readCoverage(currentJsonFilePath);

// Compare json files and get changed files
const output = compareCoverage(previousJsonFilePath, currentJsonFilePath)
const outputDir = path.join(process.cwd(), 'coverage-json');
const outputPath = path.join(outputDir, outputFileName); // Full path including the file name

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Directory created: ${outputDir}`);
} else {
  console.log(`Directory already exists: ${outputDir}`);
}

// Write the JSON file inside the directory without affecting existing files
try {
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Data extracted and saved to ${outputPath}`);
} catch (error) {
  console.error('Error writing to file:', error);
}

if (changedFiles.length > 0) {
  coverageChanged = true
}

console.log(`::set-output name=coverage_changed::${coverageChanged}`);
console.log(`::set-output name=changed_files::${changedFiles.join(', ')}`);