# Everything Green API

A robust RESTful API built with Next.js, TypeScript, and MongoDB, featuring user authentication, webhook handling, and secure data management.

## Technical Stack

-   **Framework**: Next.js with TypeScript
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JWT (JSON Web Tokens)
-   **Validation**: Zod
-   **Security Features**:
    -   Password hashing with bcryptjs
    -   Webhook signature verification
    -   Secure middleware implementation

## Features

-   User authentication (signup/login)
-   JWT-based protected routes
-   Webhook handling with signature verification
-   MongoDB integration with Mongoose schemas
-   Input validation using Zod
-   Error handling and proper HTTP status codes

## Setup Instructions

1. **Clone the repository**

```bash
git clone [repository-url]
cd everything-green
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Variables**

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URL=your_mongodb_connection_string
PRIVATE_KEY=your_jwt_private_key
PUBLIC_KEY=your_jwt_public_key
DEV_SERVER_URL=your_dev_server_url
```

4. **Run the development server**

```bash
npm run dev
```

## Testing Instructions

The project uses Jest for testing and includes comprehensive integration tests. The tests cover all major functionalities including user authentication, webhook operations, and secret management.

### Running Tests

First run the dev server is other than `http://localhost:3000/api`, specify that on the `.env` file.

Start your dev server.

```bash
# Run all tests
npm run test
```

The test suite uses MongoDB Memory Server to run tests against an in-memory database, ensuring consistent and isolated test environments.

### Test Structure

The integration tests are organized into four main sections:

1. **User Authentication Tests**

    - User registration
    - User login
    - Token validation

2. **User Management Tests**

    - Retrieving user list
    - Getting specific user details

3. **Secret Management Tests**

    - Creating webhook secrets
    - Retrieving user's secrets

4. **Webhook Operation Tests**
    - Generating webhook signatures
    - Posting webhooks with valid signatures
    - Handling invalid signatures

## API Endpoints

### Authentication

#### POST /api/auth/login

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

### Users

#### POST /api/users (Create User)

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### GET /api/users (Get All Users)

-   Requires Authentication
-   Returns list of users (password excluded)

#### GET /api/users/[id] (Get Single User)

-   Requires Authentication
-   Returns user details (password excluded)

### Webhook and Secret Management

#### Managing Webhook Secrets

1. **Create a New Secret**

    POST /api/webhook/secret

    ```json
    {
        "name": "Production Webhook",
        "value": "your-secure-secret-key"
    }
    ```

    - Requires Authentication
    - Each user can have multiple secrets for different environments
    - Secret values should be securely stored and never exposed

2. **List Your Secrets**

    GET /api/webhook/secret

    - Requires Authentication
    - Returns all secrets associated with your account
    - Response includes secret names and masked values

#### Working with Webhooks

1. **Generate Webhook Signature**

    POST /api/webhook/signature

    ```json
    {
        "event": "order.created",
        "data": {
            "orderId": "12345",
            "amount": 99.99,
            "currency": "USD"
        }
    }
    ```

    Headers:

    ```
    x-webhook-secret: your-secret-value
    Content-Type: text/plain
    ```

    Response:

    ```json
    {
        "signature": "generated-hmac-sha256-signature",
        "timestamp": "1234567890"
    }
    ```

2. **Send Webhook**

    POST /api/webhook

    ```json
    {
        "event": "order.created",
        "data": {
            "orderId": "12345",
            "amount": 99.99,
            "currency": "USD"
        }
    }
    ```

    Headers:

    ```
    x-webhook-secret: your-secret-value
    x-webhook-signature: generated-signature
    x-webhook-timestamp: timestamp-from-signature-generation
    Content-Type: application/json
    ```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Webhook Security

Webhook endpoints are secured using HMAC SHA-256 signatures. The process works as follows:

1. **Create a Webhook Secret**:

    - Use the `/api/webhook/secret` endpoint to create a secret
    - Store the secret securely for future use
    - You can create multiple secrets for different environments (dev, staging, prod)

2. **Generate a Signature**:

    - Send your webhook payload to `/api/webhook/signature`
    - Include your webhook secret in the `x-webhook-secret` header
    - The server generates a unique signature based on:
        - The webhook payload
        - Current timestamp
        - Your secret key
    - Receive a signature and timestamp pair

3. **Send Webhook Request**:
    - Send your webhook payload to `/api/webhook`
    - Include the following headers:
        - `x-webhook-signature`: The generated signature
        - `x-webhook-secret`: Your webhook secret
        - `x-webhook-timestamp`: The timestamp from signature generation
        - `Content-Type`: application/json
    - The payload must match exactly what was used for signature generation

The server verifies the webhook by:

1. Retrieving the secret associated with the `x-webhook-secret`
2. Combining the timestamp and payload
3. Creating an HMAC SHA-256 hash using the webhook secret
4. Comparing the generated hash with the provided signature
5. Validating the timestamp is within an acceptable time window

### Security Best Practices

1. **Secret Management**

    - Generate strong, unique secrets for each environment
    - Rotate secrets periodically
    - Never expose secrets in logs or client-side code

2. **Webhook Verification**
    - Always verify signatures before processing webhooks
    - Implement retry logic for failed webhook deliveries
    - Log webhook events for debugging and auditing

## Error Handling

The API returns appropriate HTTP status codes and error messages:

-   200: Success
-   201: Resource created
-   400: Bad request / Invalid input
-   401: Unauthorized
-   404: Resource not found
-   500: Internal server error

## Development

```bash
# Run development server
npm run dev

# Run linting
npm run lint
```
