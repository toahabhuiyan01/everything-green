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

3. Install dependencies:

# or

yarn install 3. **Environment Variables**

Create a `.env` file in the root directory with the following variables:

3. Set up environment variables:
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   WEBHOOK_SECRET=your_webhook_secret_key

```env
4. **Run the development server**

```

````

-   Generate signatures for webhook payloads
-   Test webhooks with custom payloads
-   Verify webhook signatures

#### POST /api/auth/login

```json
{
    "email": "user@example.com",
    "password": "password123"
}
````

### Authentication

-   `POST /api/auth/login` - User login

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

### Users

#### POST /api/webhook

-   Requires Authentication
-   Requires valid signature in `x-webhook-signature` header

```json
{
    "eventType": "event_name",
    "data": {
        "key": "value"
    }
}
```

#### POST /api/webhook/signature

-   Generates webhook signature for payload

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Webhook Security

Webhook endpoints are secured using HMAC SHA-256 signatures. To send webhook requests:

1. Generate a signature using the `/api/webhook/signature` endpoint
2. Include the signature in the `x-webhook-signature` header
3. Send your webhook payload to `/api/webhook`

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
