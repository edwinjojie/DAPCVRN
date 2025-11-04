# BOSE Database Seeders

This directory contains seed data and scripts to populate the MongoDB database with realistic test data for the BOSE (Blockchain-Oriented Student Evaluation) system.

## 📁 Directory Structure

```
seeders/
├── data/                      # Seed data files
│   ├── users.seed.js         # User accounts (all roles)
│   ├── organizations.seed.js # Universities and companies
│   ├── credentials.seed.js   # Academic/professional credentials
│   ├── jobs.seed.js          # Job postings
│   ├── applications.seed.js  # Job applications
│   ├── profiles.seed.js      # Extended user profiles
│   ├── messages.seed.js      # Messages between users
│   └── notifications.seed.js # System notifications
├── seedDatabase.js           # Main seeder script
├── clearDatabase.js          # Database clearing script
└── README.md                 # This file
```

## 🚀 Usage

### Seed the Database

To populate the database with all test data:

```bash
npm run seed
```

This will:
1. Connect to MongoDB
2. Clear all existing data
3. Create users, organizations, credentials, jobs, applications, profiles, messages, and notifications
4. Link all relationships properly
5. Display a summary of created records

### Clear the Database

To remove all data from the database:

```bash
npm run seed:clear
```

## 👥 Test Accounts

After seeding, you can log in with these accounts:

### Admin
- **Email:** `admin@bose.edu`
- **Password:** `password123`
- **Role:** Admin
- **Dashboard:** `/dashboard/admin`

### Student
- **Email:** `alice.johnson@student.edu`
- **Password:** `password123`
- **Role:** Student
- **Dashboard:** `/dashboard/student`
- **Has:** 2 verified credentials, 1 active application

### Recruiter (Google)
- **Email:** `hr@google.com`
- **Password:** `password123`
- **Role:** Recruiter
- **Dashboard:** `/dashboard/recruiter`
- **Organization:** Google LLC

### University (MIT)
- **Email:** `registrar@mit.edu`
- **Password:** `password123`
- **Role:** University
- **Dashboard:** `/dashboard/university`
- **Organization:** Massachusetts Institute of Technology

## 📊 Seeded Data Summary

### Users (22 total)
- **2** System Administrators (role: `admin`)
- **5** University Representatives (role: `university`) - MIT, Stanford, Harvard, Berkeley, IIT Delhi
- **5** Recruiters (role: `recruiter`) - Google, Microsoft, Amazon, Meta, Apple
- **10** Students (role: `student`)

### Organizations (10 total)
- **5** Universities (MIT, Stanford, Harvard, Berkeley, IIT Delhi)
- **5** Companies (Google, Microsoft, Amazon, Meta, Apple)

### Credentials (12 total)
- **10** Verified credentials (degrees, certificates, skills)
- **2** Pending credentials

### Jobs (9 total)
- **8** Active job postings
- **1** Filled position

### Applications (7 total)
- **1** Interviewed
- **1** Offered
- **1** Shortlisted
- **1** Under Review
- **1** Rejected
- **1** Accepted
- **1** Additional application

### Profiles (4 total)
- Detailed profiles for Alice, Bob, Carol, and Grace
- Includes education, experience, skills, certifications

### Messages (10 total)
- Conversations between recruiters and candidates
- System messages for credential verification
- Application status updates

### Notifications (18 total)
- Credential verification notifications
- Application status updates
- Interview schedules
- Offer notifications
- System announcements

## 🔗 Data Relationships

The seeder properly links all relationships:

- **Users ↔ Organizations:** Institutional users and recruiters linked to their organizations
- **Credentials ↔ Users:** Each credential linked to student owner and institutional issuer
- **Jobs ↔ Organizations:** Jobs linked to company organizations and recruiter users
- **Applications ↔ Jobs/Users:** Applications link candidates to jobs with attached credentials
- **Profiles ↔ Users:** Extended profiles for select students
- **Messages ↔ Users:** Messages between recruiters, students, and system
- **Notifications ↔ Users/Jobs/Credentials:** Notifications linked to relevant entities

## 🎯 Use Cases Covered

The seed data supports testing of:

1. **Authentication & Authorization**
   - Login with different roles
   - Role-based access control

2. **Credential Management**
   - View verified credentials
   - Pending verification requests
   - Blockchain integration (simulated)

3. **Job Application Workflow**
   - Browse jobs
   - Apply with credentials
   - Track application status
   - Interview scheduling
   - Offer management

4. **Messaging System**
   - Recruiter-candidate communication
   - System notifications
   - Read/unread status

5. **Profile Management**
   - View/edit student profiles
   - Skills and experience tracking
   - Resume management

6. **Organization Management**
   - University credential issuance
   - Company job postings
   - Verification workflows

## 🛠️ Customization

To add more seed data:

1. Edit the appropriate file in `data/` directory
2. Follow the existing data structure
3. Use `null` for ObjectId references (they'll be linked automatically)
4. Run `npm run seed` to apply changes

## ⚠️ Important Notes

- **All passwords are:** `password123` (for development only!)
- **Blockchain TxIds are simulated** (not real blockchain transactions)
- **File URLs are placeholders** (actual file upload not implemented in seed)
- **Email sending is simulated** (emailSent flags are set but no actual emails sent)

## 🔄 Resetting Data

To completely reset the database:

```bash
npm run seed:clear  # Clear all data
npm run seed        # Repopulate with fresh data
```

## 📝 Notes

- The seeder uses a singleton database connection
- All operations are wrapped in try-catch for error handling
- Progress is logged to console with color-coded output
- The script exits with appropriate exit codes (0 for success, 1 for failure)

