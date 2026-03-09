# BOSE Blockchain Services (New)

Welcome to the BOSE Blockchain Services! This project provides a decentralized platform for **Certificate Issuance & Verification** and **Skill Endorsement** using **Hyperledger Fabric v2.5**.

This documentation is designed to help beginners understand the architecture, folder structure, and how to get the system up and running.

---

## 🌟 Project Overview

The system allows institutions to issue digital certificates and verify student skills on a tamper-proof blockchain ledger. It consists of three main parts:
1.  **The Blockchain Network**: A Hyperledger Fabric test network where the data is stored.
2.  **The Smart Contracts (Chaincode)**: Logic that governs how certificates and skills are added, queried, and verified.
3.  **The API Layer**: A Node.js backend (`bose-backend`) and client SDK (`bose-client`) that bridge the gap between users and the blockchain.

---

## 📁 Directory Structure Explained

### 1. `bose-backend/`
The REST API server that provides endpoints for the frontend or other services to interact with the blockchain.
- **`server.js`**: The main entry point. It sets up Express, connects to MongoDB (for temporary storage/caching), and defines API routes.
- **`controllers/`**: Contains the business logic for each feature (e.g., `certificate-controller.js` handles certificate uploads and approvals).
- **`routes/`**: Defines the URL paths for the API (e.g., `/api/certificate/upload`).
- **`models/`**: MongoDB schemas for storing metadata and pending requests before they are finalized on the blockchain.
- **`middleware/`**: Functions that run before requests reach controllers (e.g., `authMiddleware.js` for checking user tokens).
- **`scripts/`**: Utility scripts for database management (e.g., `initDatabase.js`, `seedDatabase.js`).
- **`services/hash-services.js`**: A utility for generating SHA-256 hashes of certificate files.
- **`swagger.js`**: Configuration for API documentation using Swagger UI.

### 2. `bose-client/`
The "Bridge" between the backend and the blockchain.
- **`app.js`**: Uses the `fabric-network` SDK to connect to the Fabric Gateway, select a channel, and invoke chaincode functions.
- **`services/identity-services.js`**: Handles user registration and enrollment with the Certificate Authority (CA).
- **`enrollAdmin.js` / `enrollUser.js`**: Scripts to initialize the system with an administrator and regular users.
- **`registerUser.js`**: A script to register and enroll a new user identity (e.g., an institution) with the CA.
- **`config/fabric-config.js`**: Configuration for the network (channel name, MSP ID, connection profiles).
- **`index.js`**: Export point for the client functions.

### 3. `fabric-samples/`
Contains the core Hyperledger Fabric network configuration and the smart contract source code.
- **`test-network/`**: Scripts to start/stop the network, create channels, and deploy chaincode (e.g., `./network.sh up`).
- **`asset-transfer-basic/chaincode-javascript/`**: The home of our **Smart Contracts**.
    - **`lib/boseChaincode.js`**: Logic for issuing and verifying academic certificates.
    - **`lib/skillChaincode.js`**: Logic for adding and endorsing professional skills.

### 4. `wallet/`
A local directory that stores **X.509 identities** (certificates and private keys). Think of this as a digital keychain; without an identity in this wallet, you cannot perform any actions on the blockchain.

---

## ⛓️ How the Blockchain Works (The Workflow)

### 1. Identity Management
Before anyone can use the system, they must be "enrolled."
- An **Admin** is enrolled first.
- The Admin then **registers** users (like "College_XYZ").
- The system generates a certificate for the user and saves it in the `wallet/` folder.

### 2. Issuing a Certificate
1.  **Upload**: A student uploads their certificate to the `bose-backend`.
2.  **Pending**: It is stored in MongoDB as "PENDING."
3.  **Approval**: An authorized institution (like a University) reviews it and calls the `approve` endpoint.
4.  **Blockchain Write**: The backend uses `bose-client` to call the `AddCertificate` function in the chaincode.
5.  **Finality**: The certificate is now permanently recorded on the blockchain ledger.

### 3. Verification
Anyone with the `certId` or the original certificate file can verify its authenticity. The system re-calculates the file hash and checks if it matches the one stored on the blockchain. If they match, the certificate is 100% authentic.

---

## 🚀 Getting Started (Beginner's Guide)

### Prerequisites
- **Docker & Docker Compose**: To run the blockchain nodes.
- **Node.js (v18+)**: To run the backend and client scripts.
- **Go**: Required by some Fabric tools.

### Step 1: Start the Network
Navigate to the test network folder and start the nodes:
```bash
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
```

### Step 2: Deploy Chaincode
Deploy our custom contracts to the channel:
```bash
./network.sh deployCC -ccn bose -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
```

### Step 3: Setup Identities
Go to the client folder and enroll the admin and a test user:
```bash
cd ../../bose-client
npm install
node enrollAdmin.js
node registerUser.js college_xyz
```

### Step 4: Start the Backend
```bash
cd ../bose-backend
npm install
node server.js
```
The API will be available at `http://localhost:3002`.

---

## 📘 Key Blockchain Terms for Beginners

- **Ledger**: The "database" that stores all transactions. It is immutable (cannot be changed).
- **Chaincode**: Hyperledger Fabric's term for **Smart Contracts**. It's the code that runs on the blockchain.
- **Peer**: A node in the network that maintains a copy of the ledger and runs chaincode.
- **Channel**: A private "subnet" of the network. Only members of the channel can see the transactions.
- **MSP (Membership Service Provider)**: The system that manages identities and permissions.
- **CA (Certificate Authority)**: The entity that issues the digital certificates stored in your `wallet`.

---

## 🛠️ Main API Endpoints

- `POST /api/certificate/upload`: Upload a certificate for verification.
- `POST /api/certificate/approve/:certId`: Finalize a certificate on the blockchain.
- `GET /api/certificate/:certId`: Retrieve certificate details from the blockchain.
- `POST /api/skill/add`: Add a verified skill to a student's profile.
- `GET /api/skill/:skillId`: Query a skill record.

---

*Happy Coding! If you have any questions, check the [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/).*
