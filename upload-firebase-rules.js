/**
 * This script uploads Firestore security rules to your Firebase project.
 * To use it:
 * 1. Install the Firebase Admin SDK: npm install firebase-admin
 * 2. Download your Firebase service account key from:
 *    Firebase Console > Project Settings > Service Accounts > Generate New Private Key
 * 3. Rename the downloaded file to service-account.json and place it in the project root
 * 4. Run this script: node upload-firebase-rules.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Try to load service account
let serviceAccount;
try {
  serviceAccount = require('./service-account.json');
} catch (error) {
  console.error('\x1b[31mError: service-account.json not found!\x1b[0m');
  console.log(`
Please download your service account key:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Rename the downloaded file to service-account.json
4. Place it in the root of your project
5. Then run this script again
`);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Read the rules file
const rulesPath = path.join(__dirname, 'firebase-rules.txt');
let rulesContent;

try {
  rulesContent = fs.readFileSync(rulesPath, 'utf8');
} catch (error) {
  console.error('\x1b[31mError: Could not read firebase-rules.txt\x1b[0m');
  process.exit(1);
}

// Upload the rules
async function uploadRules() {
  try {
    console.log('\x1b[33mUploading Firestore security rules...\x1b[0m');
    
    // Clean up the rules if necessary (remove comments if they cause issues)
    const cleanRules = rulesContent.replace(/\/\/ .*$/gm, '').trim();
    
    await admin.firestore().getClient().then(client => {
      // Get the project ID from the service account
      const projectId = serviceAccount.project_id;
      return client.database.projects.databases.updateDatabase(`projects/${projectId}/databases/(default)`, {
        updateMask: {
          paths: ['rulesContent'],
        },
        requestBody: {
          rulesContent: cleanRules,
        },
      });
    });
    
    console.log('\x1b[32mFirebase rules uploaded successfully!\x1b[0m');
    console.log('\nYou can now verify your rules in the Firebase Console.');
  } catch (error) {
    console.error('\x1b[31mError uploading rules:\x1b[0m', error);
    console.log('\nAlternatively, you can manually update your rules in the Firebase Console:');
    console.log('1. Go to Firebase Console > Firestore Database > Rules');
    console.log('2. Paste the rules from firebase-rules.txt');
    console.log('3. Click "Publish"');
  }
}

uploadRules(); 