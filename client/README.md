# City News Search — Client App

> **Expo (React Native) + TypeScript + React Query + Axios**

---

## Overview

This is the **User Mobile Application** for City News Search. It allows users to:

- Register / Login
- Search latest news for their city
- Automatically track session duration

The app communicates only with the backend API. It does **not** call the Google SERP API directly.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> Replace with your deployed backend URL in production.

### 3. Start Development Server

```bash
npx expo start
```

Press:
- `a` → Android
- `i` → iOS
- `w` → Web

---

## Features

### Authentication
- Email + password login
- Register new account
- Secure token storage
- Convex JWT support
- Automatic protected route handling

### Dashboard
- Edit city
- Search latest news
- Display minimal article details:
  - Title
  - Description
  - Source
  - Published date

### Session Tracking
- Session created on login
- `sessionId` stored locally
- On logout: logout API called, session closed in backend
- If app crashes: session remains open *(acceptable per backend spec)*

---

## API Integration

The app communicates with the backend using a centralized Axios client.

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login + receive tokens |
| `POST` | `/api/auth/logout` | Close session |

### News Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/news?city=mumbai&sessionId=...` | Fetch news + log search |

> All protected requests include: `Authorization: Bearer <token>`

---

## Authentication Flow

1. User logs in or registers.
2. Backend returns:
   - Access token
   - `sessionId`
3. Client stores:
   - Access token → `SecureStore`
   - `sessionId` → in-memory state
4. All future requests include the access token in the `Authorization` header.
5. On logout or background event, the client calls `/api/auth/logout` with the `sessionId`.

---

## Screens

### 1. Login / Register
- Email input
- Password input
- Name input *(register only)*
- Submit button

On success:
- Save token
- Save `sessionId`
- Navigate to Dashboard

### 2. Dashboard

**City Input**
- Editable text field

**Search Button**
- Calls `GET /api/news`
- Sends `sessionId`

**Results List**
- Rendered via `FlatList`

---

## State Management

| Concern | Solution |
|---------|----------|
| Server state (news results) | React Query |
| Token storage | SecureStore |
| Session ID | In-memory state |
| Request handling | Centralized Axios client |

---

## Error Handling

- Loading states for all API calls
- Graceful empty results handling
- Auto redirect to login on `401`
- Network error fallback messaging

---

## Security

- Tokens stored securely via `SecureStore`
- No direct third-party API exposure
- All sensitive operations handled by backend
- `Authorization` header required for protected routes

---

## Design Philosophy

The client is intentionally lightweight. Its responsibilities are:

- UI rendering
- API communication
- Session lifecycle triggering

It is **not** responsible for:

- Business logic
- Data persistence
- Third-party integrations

---

## Conclusion

This client application demonstrates:

- Clean frontend architecture
- Proper backend integration
- Secure authentication handling
- Session lifecycle awareness
- Production-style separation of concerns

The focus was on functionality, clarity, and correct integration rather than UI complexity.