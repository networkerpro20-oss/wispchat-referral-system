# API Documentation - WispChat Referral System

## Base URL
```
http://localhost:3000/api
```

## Response Format

All endpoints return JSON responses with the following structure:

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Endpoints

### Root Endpoint

#### GET /
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "WispChat Referral System API - Easy Access Newtelecom",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "referrals": "/api/referrals",
    "rewards": "/api/rewards"
  }
}
```

---

## Users Endpoints

### Create User

**POST** `/api/users`

Creates a new user in the system. If a referral code is provided, it automatically creates the referral relationship and awards points to the referrer.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+502 1234-5678",
  "referralCode": "EA-ABC123"  // Optional
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+502 1234-5678",
    "referralCode": "EA-XYZ789",
    "totalRewards": 0,
    "referralCount": 0,
    "createdAt": "2025-12-04T03:00:00.000Z",
    "isActive": true
  }
}
```

**Error Responses:**
- `400` - Missing required fields (name, email, phone)
- `409` - User with email already exists

---

### Get All Users

**GET** `/api/users`

Returns a list of all users in the system.

**Success Response (200):**
```json
{
  "count": 2,
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+502 1234-5678",
      "referralCode": "EA-XYZ789",
      "totalRewards": 100,
      "referralCount": 1,
      "createdAt": "2025-12-04T03:00:00.000Z",
      "isActive": true
    }
  ]
}
```

---

### Get User by ID

**GET** `/api/users/:id`

Returns details of a specific user.

**Parameters:**
- `id` (path) - User UUID

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+502 1234-5678",
    "referralCode": "EA-XYZ789",
    "totalRewards": 100,
    "referralCount": 1,
    "createdAt": "2025-12-04T03:00:00.000Z",
    "isActive": true
  }
}
```

**Error Response:**
- `404` - User not found

---

### Get User by Referral Code

**GET** `/api/users/referral-code/:code`

Returns the user associated with a specific referral code.

**Parameters:**
- `code` (path) - Referral code (e.g., EA-XYZ789)

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+502 1234-5678",
    "referralCode": "EA-XYZ789",
    "totalRewards": 100,
    "referralCount": 1,
    "createdAt": "2025-12-04T03:00:00.000Z",
    "isActive": true
  }
}
```

**Error Response:**
- `404` - User not found with this referral code

---

## Referrals Endpoints

### Get All Referrals

**GET** `/api/referrals`

Returns all referrals in the system.

**Success Response (200):**
```json
{
  "count": 5,
  "referrals": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "referrerId": "550e8400-e29b-41d4-a716-446655440000",
      "referredUserId": "770e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "rewardAmount": 100,
      "createdAt": "2025-12-04T03:00:00.000Z",
      "completedAt": "2025-12-04T03:00:00.000Z"
    }
  ]
}
```

---

### Get Referral by ID

**GET** `/api/referrals/:id`

Returns details of a specific referral.

**Parameters:**
- `id` (path) - Referral UUID

**Success Response (200):**
```json
{
  "referral": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "referrerId": "550e8400-e29b-41d4-a716-446655440000",
    "referredUserId": "770e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "rewardAmount": 100,
    "createdAt": "2025-12-04T03:00:00.000Z",
    "completedAt": "2025-12-04T03:00:00.000Z"
  }
}
```

**Error Response:**
- `404` - Referral not found

---

### Get Referrals by User

**GET** `/api/referrals/user/:userId`

Returns all referrals made by a specific user.

**Parameters:**
- `userId` (path) - User UUID

**Success Response (200):**
```json
{
  "count": 3,
  "referrals": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "referrerId": "550e8400-e29b-41d4-a716-446655440000",
      "referredUserId": "770e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "rewardAmount": 100,
      "createdAt": "2025-12-04T03:00:00.000Z",
      "completedAt": "2025-12-04T03:00:00.000Z"
    }
  ]
}
```

**Error Response:**
- `404` - User not found

---

### Get Referral Statistics

**GET** `/api/referrals/stats`

Returns overall statistics for the referral system.

**Success Response (200):**
```json
{
  "totalUsers": 150,
  "totalReferrals": 85,
  "completedReferrals": 80,
  "totalRewards": 8000
}
```

---

## Rewards Endpoints

### Get All Rewards

**GET** `/api/rewards`

Returns all rewards in the system.

**Success Response (200):**
```json
{
  "count": 10,
  "totalAmount": 1000,
  "rewards": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 100,
      "type": "referral",
      "description": "Referral reward for Carlos López",
      "status": "approved",
      "createdAt": "2025-12-04T03:00:00.000Z",
      "redeemedAt": null
    }
  ]
}
```

---

### Get Reward by ID

**GET** `/api/rewards/:id`

Returns details of a specific reward.

**Parameters:**
- `id` (path) - Reward UUID

**Success Response (200):**
```json
{
  "reward": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100,
    "type": "referral",
    "description": "Referral reward for Carlos López",
    "status": "approved",
    "createdAt": "2025-12-04T03:00:00.000Z",
    "redeemedAt": null
  }
}
```

**Error Response:**
- `404` - Reward not found

---

### Get Rewards by User

**GET** `/api/rewards/user/:userId`

Returns all rewards for a specific user.

**Parameters:**
- `userId` (path) - User UUID

**Success Response (200):**
```json
{
  "count": 5,
  "totalAmount": 500,
  "rewards": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 100,
      "type": "referral",
      "description": "Referral reward for Carlos López",
      "status": "approved",
      "createdAt": "2025-12-04T03:00:00.000Z",
      "redeemedAt": null
    }
  ]
}
```

**Error Response:**
- `404` - User not found

---

### Redeem Reward

**POST** `/api/rewards/:id/redeem`

Marks a reward as redeemed.

**Parameters:**
- `id` (path) - Reward UUID

**Success Response (200):**
```json
{
  "message": "Reward redeemed successfully",
  "reward": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100,
    "type": "referral",
    "description": "Referral reward for Carlos López",
    "status": "redeemed",
    "createdAt": "2025-12-04T03:00:00.000Z",
    "redeemedAt": "2025-12-04T04:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Reward not found
- `400` - Reward has already been redeemed
- `400` - Reward must be approved before it can be redeemed

---

## Data Models

### User Object
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "referralCode": "string",
  "totalRewards": "number",
  "referralCount": "number",
  "createdAt": "ISO8601 datetime",
  "isActive": "boolean"
}
```

### Referral Object
```json
{
  "id": "uuid",
  "referrerId": "uuid",
  "referredUserId": "uuid",
  "status": "pending | completed | cancelled",
  "rewardAmount": "number",
  "createdAt": "ISO8601 datetime",
  "completedAt": "ISO8601 datetime | null"
}
```

### Reward Object
```json
{
  "id": "uuid",
  "userId": "uuid",
  "amount": "number",
  "type": "referral | bonus | promotion",
  "description": "string",
  "status": "pending | approved | redeemed",
  "createdAt": "ISO8601 datetime",
  "redeemedAt": "ISO8601 datetime | null"
}
```

## Example Workflow

1. **User A registers:**
   ```bash
   POST /api/users
   {
     "name": "María García",
     "email": "maria@example.com",
     "phone": "+502 1234-5678"
   }
   # Returns referralCode: "EA-ABC123"
   ```

2. **User A shares their code with User B**

3. **User B registers with User A's code:**
   ```bash
   POST /api/users
   {
     "name": "Carlos López",
     "email": "carlos@example.com",
     "phone": "+502 8765-4321",
     "referralCode": "EA-ABC123"
   }
   ```

4. **System automatically:**
   - Creates User B
   - Creates referral record
   - Awards 100 points to User A
   - Creates approved reward for User A

5. **Check User A's rewards:**
   ```bash
   GET /api/rewards/user/{userA-id}
   # Shows 100 points from referral
   ```

6. **View statistics:**
   ```bash
   GET /api/referrals/stats
   # Shows total users, referrals, and rewards
   ```
