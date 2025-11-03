# University Module - Backend API Documentation

## Overview

The University Module provides a complete REST API for university users to manage credential verification, approve/reject verification requests, view issued credentials, search students, and access analytics.

**Base URL:** `/api/university`  
**Authentication:** Required (JWT Bearer Token)  
**Role:** `university` or `institution`

---

## Authentication

All endpoints require an Authorization header with a valid JWT token:

```http
Authorization: Bearer <jwt_token>
```

The token must contain:
- `userId`: User's unique identifier
- `email`: User's email address
- `role`: Must be `"university"` or `"institution"`
- `organization`: University/Organization name

**Example Token Creation (at login):**
```javascript
const token = jwt.sign(
  { 
    userId: 'user_inst',
    email: 'iit@dapcvrn.com',
    role: 'university',
    organization: 'IIT Delhi'
  },
  jwtSecret,
  { expiresIn: '24h' }
);
```

---

## Endpoints

### 1. Verification Requests

#### GET `/api/university/verification/requests`

List all verification requests (pending, approved, or rejected).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | all | Filter by status: `pending`, `approved`, `rejected` |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "VR-001",
      "studentId": "student_001",
      "studentName": "Sarah Chen",
      "studentEmail": "sarah@example.com",
      "credentialId": "cred_001",
      "credentialType": "Degree",
      "credentialTitle": "B.Tech Computer Science",
      "status": "pending",
      "submittedAt": "2024-02-01T10:30:00Z",
      "approvedAt": null,
      "rejectionReason": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/university/verification/requests?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Status Codes:**
- `200`: Success
- `400`: Invalid query parameters
- `401`: Missing or invalid token
- `403`: User role is not university

---

#### GET `/api/university/verification/requests/:requestId`

Get details of a specific verification request.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "VR-001",
    "studentId": "student_001",
    "studentName": "Sarah Chen",
    "studentEmail": "sarah@example.com",
    "credentialId": "cred_001",
    "credentialType": "Degree",
    "credentialTitle": "B.Tech Computer Science",
    "status": "pending",
    "submittedAt": "2024-02-01T10:30:00Z",
    "approvedAt": null,
    "rejectionReason": null
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Request not found

---

### 2. Approve Credential

#### POST `/api/university/verification/approve/:requestId`

Approve a pending credential verification request and issue the credential.

**Request Body (Optional):**
```json
{
  "fileUrl": "https://credentials.example.com/document.pdf",
  "timestamp": "2024-02-15T14:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credential approved successfully",
  "verificationRequest": {
    "_id": "VR-001",
    "studentId": "student_001",
    "status": "approved",
    "approvedAt": "2024-02-15T14:30:00Z"
  },
  "issuedCredential": {
    "_id": "IC-001",
    "studentId": "student_001",
    "studentName": "Sarah Chen",
    "credentialType": "Degree",
    "credentialTitle": "B.Tech Computer Science",
    "issuedBy": "IIT Delhi",
    "issuedDate": "2024-02-15",
    "verifiedOn": "2024-02-15T14:30:00Z",
    "hash": "sha256_hash_example_64_characters",
    "status": "verified"
  },
  "hash": "sha256_hash_example_64_characters",
  "timestamp": "2024-02-15T14:30:00Z"
}
```

**Process:**
1. Validates the verification request exists
2. Checks request status is "pending"
3. Generates SHA256 hash from file URL and timestamp
4. Updates verification request status to "approved"
5. Creates new issued credential entry
6. Returns both updated request and new credential

**Status Codes:**
- `200`: Success
- `400`: Invalid request or already processed
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Request not found

**Error Examples:**
```json
{
  "error": "Request already approved",
  "currentStatus": "approved"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/university/verification/approve/VR-001" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://credentials.example.com/sarah_chen.pdf",
    "timestamp": "2024-02-15T14:30:00Z"
  }'
```

---

### 3. Reject Credential

#### POST `/api/university/verification/reject/:requestId`

Reject a pending credential verification request with a reason.

**Request Body:**
```json
{
  "reason": "Document does not meet verification standards"
}
```

**Validation:**
- `reason` is required
- Minimum length: 5 characters
- Maximum length: 500 characters

**Response:**
```json
{
  "success": true,
  "message": "Credential rejected successfully",
  "verificationRequest": {
    "_id": "VR-001",
    "studentId": "student_001",
    "status": "rejected",
    "rejectionReason": "Document does not meet verification standards",
    "approvedAt": null
  },
  "timestamp": "2024-02-15T14:35:00Z"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request, invalid reason, or already processed
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Request not found

**Error Examples:**
```json
{
  "error": "\"reason\" length must be at least 5 characters long"
}
```

```json
{
  "error": "Request already rejected",
  "currentStatus": "rejected"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/university/verification/reject/VR-001" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Certificate expired and cannot be verified"
  }'
```

---

### 4. Issued Credentials

#### GET `/api/university/credentials/issued`

List all credentials issued by the university.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | all | Filter by credential type (e.g., "Degree", "Certificate") |
| `startDate` | string | - | Filter by start date (ISO 8601 format) |
| `endDate` | string | - | Filter by end date (ISO 8601 format) |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "IC-001",
      "studentId": "student_001",
      "studentName": "Sarah Chen",
      "credentialType": "Degree",
      "credentialTitle": "B.Tech Computer Science",
      "issuedBy": "IIT Delhi",
      "issuedDate": "2024-02-15",
      "verifiedOn": "2024-02-15T14:30:00Z",
      "hash": "sha256_hash_example",
      "status": "verified"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "totalPages": 13
  }
}
```

**Example Requests:**
```bash
# Get all issued credentials
curl -X GET "http://localhost:3001/api/university/credentials/issued" \
  -H "Authorization: Bearer <token>"

# Filter by type
curl -X GET "http://localhost:3001/api/university/credentials/issued?type=Degree" \
  -H "Authorization: Bearer <token>"

# Filter by date range
curl -X GET "http://localhost:3001/api/university/credentials/issued?startDate=2024-01-01&endDate=2024-02-28" \
  -H "Authorization: Bearer <token>"
```

**Status Codes:**
- `200`: Success
- `400`: Invalid query parameters
- `401`: Unauthorized
- `403`: Forbidden

---

#### GET `/api/university/credentials/issued/:credentialId`

Get details of a specific issued credential.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "IC-001",
    "studentId": "student_001",
    "studentName": "Sarah Chen",
    "credentialType": "Degree",
    "credentialTitle": "B.Tech Computer Science",
    "issuedBy": "IIT Delhi",
    "issuedDate": "2024-02-15",
    "verifiedOn": "2024-02-15T14:30:00Z",
    "hash": "sha256_hash_example",
    "status": "verified"
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Credential not found

---

### 5. Student Search

#### GET `/api/university/students/search`

Search students by name, email, or degree with credential summary.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | - | Search by student name (case-insensitive partial match) |
| `email` | string | - | Search by email (must be valid email format) |
| `degree` | string | - | Search by degree (case-insensitive partial match) |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "student_001",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "degree": "B.Tech Computer Science",
      "enrollmentYear": 2020,
      "credentialCount": 1,
      "credentialSummary": {
        "issuedCount": 1,
        "pendingCount": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Example Requests:**
```bash
# Search by name
curl -X GET "http://localhost:3001/api/university/students/search?name=Sarah" \
  -H "Authorization: Bearer <token>"

# Search by email
curl -X GET "http://localhost:3001/api/university/students/search?email=sarah@example.com" \
  -H "Authorization: Bearer <token>"

# Search by degree
curl -X GET "http://localhost:3001/api/university/students/search?degree=Computer" \
  -H "Authorization: Bearer <token>"

# Combine filters
curl -X GET "http://localhost:3001/api/university/students/search?name=Sarah&degree=Computer&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Validation:**
- Email parameter must be valid email format
- All search parameters are optional
- If no filters provided, returns all students (paginated)

**Status Codes:**
- `200`: Success
- `400`: Invalid email format or pagination parameters
- `401`: Unauthorized
- `403`: Forbidden

**Error Example:**
```json
{
  "error": "\"email\" must be a valid email"
}
```

---

### 6. Analytics

#### GET `/api/university/reports/analytics`

Get comprehensive analytics and statistics for the university dashboard.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "summary": {
      "totalPending": 2,
      "totalApproved": 15,
      "totalRejected": 3,
      "totalIssued": 15,
      "averageVerificationTimeMinutes": 180
    },
    "credentialBreakdown": {
      "byType": {
        "Degree": 10,
        "Certificate": 5
      },
      "byStatus": {
        "verified": 15,
        "pending": 2,
        "rejected": 3
      }
    },
    "monthlyVerifications": {
      "2024-02": 8,
      "2024-01": 5,
      "2023-12": 2
    },
    "recentActivity": {
      "recentRequests": [
        {
          "_id": "VR-001",
          "studentName": "Sarah Chen",
          "status": "pending",
          "submittedAt": "2024-02-15T10:30:00Z"
        }
      ],
      "recentCredentials": [
        {
          "_id": "IC-001",
          "studentName": "Sarah Chen",
          "verifiedOn": "2024-02-15T14:30:00Z"
        }
      ]
    },
    "timestamp": "2024-02-15T15:00:00Z"
  }
}
```

**Metrics Included:**
- **Summary**: Total counts and average verification time
- **Credential Breakdown**: Count by type and status
- **Monthly Verifications**: Last 6 months of issued credentials
- **Recent Activity**: Last 5 requests and credentials

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/university/reports/analytics" \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid input data | Request body or query parameters are invalid |
| 401 | Access token required | Missing or invalid JWT token |
| 403 | Insufficient permissions | User role is not `university` or `institution` |
| 404 | Resource not found | Requested verification request or credential not found |
| 500 | Internal server error | Server-side error occurred |

---

## Testing

Run the comprehensive test suite:

```bash
# Run all university tests
npm run test:university

# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The test suite includes:
- ✅ Authentication & authorization tests
- ✅ Verification request listing and filtering
- ✅ Approval workflow with hash generation
- ✅ Rejection workflow with validation
- ✅ Issued credentials listing and filtering
- ✅ Student search functionality
- ✅ Analytics data accuracy
- ✅ Error handling for all scenarios
- ✅ Pagination tests
- ✅ Detail endpoint tests

---

## Mock Users for Testing

The system includes mock users for testing:

```javascript
{
  "email": "iit@dapcvrn.com",
  "password": "any", // Demo mode accepts any password
  "role": "institution", // or "university"
  "name": "IIT Issuer",
  "organization": "IITMSP"
}
```

**Login Endpoint:** `POST /api/auth/login`

```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "iit@dapcvrn.com",
    "password": "any"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_inst",
    "email": "iit@dapcvrn.com",
    "name": "IIT Issuer",
    "role": "institution",
    "organization": "IITMSP"
  }
}
```

---

## Implementation Notes

### Database Integration (Future)

Currently using in-memory mock data. For MongoDB integration:

1. Create Mongoose schemas:
   - `VerificationRequest`
   - `IssuedCredential`
   - `Student`

2. Replace mock data arrays with database queries

3. Add validation at the database level

### Hash Generation

The SHA256 hash is generated using:
```javascript
crypto.createHash('sha256').update(fileUrl + timestamp).digest('hex')
```

This creates a 64-character hex string (256-bit hash).

### Pagination

All list endpoints support pagination with:
- Default limit: 10 items
- Maximum limit: 100 items
- Default page: 1

### Timestamps

All timestamps are in ISO 8601 format (UTC):
- Example: `2024-02-15T14:30:00Z`
- Stored as strings for easy JSON serialization

---

## API Rate Limiting

Development environment: Relaxed (100,000 requests per 15 minutes)  
Production environment: 100 requests per 15 minutes per IP

---

## Support & Documentation

For issues or questions:
1. Check test cases in `university.test.js`
2. Review mock data in `university.js`
3. Check error messages for validation details

---

## Version

**University Module API v1.0**  
**Last Updated:** February 2024