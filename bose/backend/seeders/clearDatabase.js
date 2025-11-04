import dotenv from 'dotenv';
import database from '../config/database.js';
import { User, Organization, Credential, Job, Application, Message, Notification, Profile } from '../models/index.js';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

async function clearDatabase() {
  try {
    console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════╗
║   BOSE Database Clearer                    ║
║   Removing all data from MongoDB           ║
╚════════════════════════════════════════════╝${colors.reset}
    `);
    
    // Connect to database
    console.log(`${colors.cyan}ℹ${colors.reset} Connecting to MongoDB...`);
    await database.connect();
    console.log(`${colors.green}✓${colors.reset} Connected to MongoDB\n`);
    
    // Clear all collections
    console.log(`${colors.yellow}⚠${colors.reset} Clearing all collections...\n`);
    
    await User.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Users collection`);
    
    await Organization.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Organizations collection`);
    
    await Credential.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Credentials collection`);
    
    await Job.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Jobs collection`);
    
    await Application.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Applications collection`);
    
    await Profile.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Profiles collection`);
    
    await Message.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Messages collection`);
    
    await Notification.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared Notifications collection`);
    
    console.log(`\n${colors.green}${colors.bright}✓ All collections cleared successfully!${colors.reset}\n`);
    
    // Close connection
    await database.disconnect();
    
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to clear database:`, error.message);
    console.error(error);
    process.exit(1);
  }
}

clearDatabase();

