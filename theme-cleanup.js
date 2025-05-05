import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using fileURLToPath from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify fs functions
const readdir = (dir) => fs.promises.readdir(dir);
const readFile = (file) => fs.promises.readFile(file);
const writeFile = (file, content) => fs.promises.writeFile(file, content);
const stat = (path) => fs.promises.stat(path);

// Color mappings for substitution
const colorMappings = {
  // Text colors
  'text-emerald-50': 'text-gray-200',
  'text-emerald-100': 'text-gray-300',
  'text-emerald-200': 'text-gray-400',
  'text-emerald-300': 'text-gray-500',
  'text-emerald-400': 'text-gray-600',
  'text-emerald-500': 'text-gray-700',
  'text-emerald-600': 'text-gray-700',
  'text-emerald-700': 'text-gray-800',
  'text-emerald-800': 'text-gray-900',
  'text-emerald-900': 'text-black',

  // Background colors
  'bg-emerald-50': 'bg-gray-50',
  'bg-emerald-100': 'bg-gray-100',
  'bg-emerald-200': 'bg-gray-200',
  'bg-emerald-300': 'bg-gray-300',
  'bg-emerald-400': 'bg-gray-400',
  'bg-emerald-500': 'bg-gray-500',
  'bg-emerald-600': 'bg-gray-600',
  'bg-emerald-700': 'bg-gray-700',
  'bg-emerald-800': 'bg-gray-800',
  'bg-emerald-900': 'bg-gray-900',

  // Border colors
  'border-emerald-50': 'border-gray-50',
  'border-emerald-100': 'border-gray-100',
  'border-emerald-200': 'border-gray-200',
  'border-emerald-300': 'border-gray-300',
  'border-emerald-400': 'border-gray-400',
  'border-emerald-500': 'border-gray-500',
  'border-emerald-600': 'border-gray-600',
  'border-emerald-700': 'border-gray-700',
  'border-emerald-800': 'border-gray-800',
  'border-emerald-900': 'border-gray-900',

  // Hover states
  'hover:bg-emerald-50': 'hover:bg-gray-50',
  'hover:bg-emerald-100': 'hover:bg-gray-100',
  'hover:bg-emerald-200': 'hover:bg-gray-200',
  'hover:bg-emerald-300': 'hover:bg-gray-300',
  'hover:bg-emerald-400': 'hover:bg-gray-400',
  'hover:bg-emerald-500': 'hover:bg-gray-500',
  'hover:bg-emerald-600': 'hover:bg-gray-600',
  'hover:bg-emerald-700': 'hover:bg-gray-700',
  'hover:bg-emerald-800': 'hover:bg-gray-800',
  'hover:bg-emerald-900': 'hover:bg-gray-900',

  'hover:text-emerald-50': 'hover:text-gray-100',
  'hover:text-emerald-100': 'hover:text-gray-200',
  'hover:text-emerald-200': 'hover:text-gray-300',
  'hover:text-emerald-300': 'hover:text-gray-400',
  'hover:text-emerald-400': 'hover:text-gray-500',
  'hover:text-emerald-500': 'hover:text-gray-600',
  'hover:text-emerald-600': 'hover:text-gray-700',
  'hover:text-emerald-700': 'hover:text-gray-800',
  'hover:text-emerald-800': 'hover:text-gray-900',
  'hover:text-emerald-900': 'hover:text-black',

  // Focus states
  'focus:ring-emerald-50': 'focus:ring-gray-200',
  'focus:ring-emerald-100': 'focus:ring-gray-300',
  'focus:ring-emerald-200': 'focus:ring-gray-400',
  'focus:ring-emerald-300': 'focus:ring-gray-500',
  'focus:ring-emerald-400': 'focus:ring-gray-600',
  'focus:ring-emerald-500': 'focus:ring-gray-500',
  'focus:ring-emerald-600': 'focus:ring-gray-600',
  'focus:ring-emerald-700': 'focus:ring-gray-700',
  'focus:ring-emerald-800': 'focus:ring-gray-800',
  'focus:ring-emerald-900': 'focus:ring-gray-900',

  // Gradient backgrounds
  'from-emerald-50': 'from-gray-50',
  'from-emerald-100': 'from-gray-100',
  'from-emerald-200': 'from-gray-200',
  'from-emerald-300': 'from-gray-300',
  'from-emerald-400': 'from-gray-400',
  'from-emerald-500': 'from-gray-500',
  'from-emerald-600': 'from-gray-600',
  'from-emerald-700': 'from-gray-700',
  'from-emerald-800': 'from-gray-800',
  'from-emerald-900': 'from-gray-900',

  'to-emerald-50': 'to-gray-50',
  'to-emerald-100': 'to-gray-100',
  'to-emerald-200': 'to-gray-200',
  'to-emerald-300': 'to-gray-300',
  'to-emerald-400': 'to-gray-400',
  'to-emerald-500': 'to-gray-500',
  'to-emerald-600': 'to-gray-600',
  'to-emerald-700': 'to-gray-700',
  'to-emerald-800': 'to-gray-800',
  'to-emerald-900': 'to-gray-900',

  // Other color schemes
  'text-blue-500': 'text-gray-600',
  'text-blue-600': 'text-gray-700',
  'bg-blue-500': 'bg-gray-500',
  'bg-blue-600': 'bg-gray-600',
  'hover:bg-blue-600': 'hover:bg-gray-600',
  'hover:bg-blue-700': 'hover:bg-gray-700',
  'border-blue-500': 'border-gray-500',
  'from-blue-500': 'from-gray-500',
  'to-blue-500': 'to-gray-500',

  'text-red-500': 'text-gray-600',
  'text-red-600': 'text-gray-700',
  'bg-red-50': 'bg-gray-50',
  'bg-red-500': 'bg-gray-500',
  'bg-red-600': 'bg-gray-600',
  'border-red-500': 'border-gray-400',
  'border-l-4 border-red-500': 'border-l-4 border-gray-400',
  'border-l-4 border-emerald-500': 'border-l-4 border-gray-400',

  'text-amber-500': 'text-gray-600',
  'bg-amber-50': 'bg-gray-50',
  'border-amber-500': 'border-gray-400',

  // Animation properties
  'transition-colors': '',
  'animate-gradient': '',
  'animate-spin': '',
};

// List of styling properties to remove entirely
const removeProperties = [
  'hover:shadow-lg',
  'shadow-md',
  'shadow-sm',
  'shadow-lg',
  'transition-shadow',
  'transition-all',
];

// Specifically replace gradient classes
const replaceGradientClasses = (content) => {
  return content
    .replace(/bg-gradient-to-r from-[a-z]+-\d{3} to-[a-z]+-\d{3}/g, 'bg-gray-100')
    .replace(/bg-gradient-to-br from-[a-z]+-\d{3} to-[a-z]+-\d{3}/g, 'bg-gray-100');
};

// Process a single file
async function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = (await readFile(filePath)).toString();
    
    // First replace gradient classes
    content = replaceGradientClasses(content);
    
    // Then replace all mapped color classes
    for (const [original, replacement] of Object.entries(colorMappings)) {
      // Use regex to match the class name with word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      content = content.replace(regex, replacement);
    }
    
    // Remove properties entirely
    for (const prop of removeProperties) {
      const regex = new RegExp(`\\s+${prop}\\b`, 'g');
      content = content.replace(regex, '');
    }
    
    await writeFile(filePath, content);
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Recursively scan directories
async function scanDirectory(directory) {
  try {
    const entries = await readdir(directory);
    
    for (const entry of entries) {
      const entryPath = path.join(directory, entry);
      const stats = await stat(entryPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules
        if (entry === 'node_modules' || entry === '.git' || entry === 'build' || entry === 'dist') {
          continue;
        }
        
        await scanDirectory(entryPath);
      } else if (stats.isFile() && /\.(jsx?|tsx?)$/.test(entry)) {
        await processFile(entryPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${directory}:`, error);
  }
}

// Main function
async function main() {
  const srcDirectory = path.join(__dirname, 'src');
  console.log('Starting theme cleanup...');
  await scanDirectory(srcDirectory);
  console.log('Theme cleanup complete!');
}

main().catch(console.error); 