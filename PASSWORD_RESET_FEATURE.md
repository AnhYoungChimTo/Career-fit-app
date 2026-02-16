# Password Reset & Security Features

## Overview

This document describes the password reset and change password features implemented in the Career Fit Analysis application, including security questions, 3-step linear flow, and settings management.

## Features Implemented

### 1. Forgot Password Flow (Linear 3-Step Process)

A secure, user-friendly password reset process that requires users to verify their identity through security questions.

#### Step 1: Email Verification
- User enters their registered email address
- System retrieves and displays their security question
- Error handling for non-existent accounts

#### Step 2: Security Question Verification
- Displays the user's chosen security question
- User must provide the correct answer
- Answer is verified against hashed value in database
- Cannot proceed to Step 3 without correct answer
- No limit on attempts

#### Step 3: New Password
- Only shown after successful security answer verification
- User enters new password
- Password confirmation required
- Password strength validation:
  - Minimum 8 characters
  - Must contain at least one number
  - Must contain at least one special character

#### Success
- Password updated in database
- User redirected to login page after 3 seconds
- Can click "Go to Login" for immediate redirect

### 2. Change Password Feature (For Logged-In Users)

Allows authenticated users to change their password from the dashboard.

#### Access
- Settings dropdown in top-right of dashboard
- Hover to open (3-second delay before closing)
- Contains "Change Password" and "Logout" options

#### Process
- Opens modal with password change form
- Requires current password verification
- Enter new password
- Confirm new password
- Same password strength validation as registration

#### Security
- Must verify current password before allowing change
- Protected route (requires JWT authentication)
- Cannot change password without knowing current password

### 3. Security Question System

#### Available Questions
1. What was the name of your first pet?
2. What city were you born in?
3. What is your mother's maiden name?
4. What was the name of your elementary school?
5. What was your childhood nickname?

#### Security Measures
- Answers are hashed using bcrypt (same as passwords)
- Answers are normalized (lowercase and trimmed) before hashing
- Verification compares hashed values, not plain text
- No way to retrieve the original answer

#### Registration Fix (IMPORTANT)
**Problem:** Previously, the first security question was pre-selected by default, causing users to accidentally register with the wrong question.

**Solution:**
- Default value changed from `SECURITY_QUESTIONS[0]` to empty string
- Added placeholder option: "Select a security question..."
- Added validation to ensure users actively select a question
- Forces conscious choice during registration

## Technical Implementation

### Frontend Components

#### 1. ForgotPassword.tsx
**Location:** `frontend/src/pages/ForgotPassword.tsx`

**Features:**
- 3-step state management: `'email' | 'security' | 'password'`
- Separate forms for each step
- Step-by-step progress indicators (Step X of 3)
- Success screen with auto-redirect
- Back navigation to retry with different email

#### 2. ChangePasswordModal.tsx
**Location:** `frontend/src/components/ChangePasswordModal.tsx`

**Features:**
- Modal overlay design
- Eye icons to show/hide password fields
- Real-time validation
- Success confirmation with auto-close
- Error handling with clear messages

#### 3. SettingsDropdown.tsx
**Location:** `frontend/src/components/SettingsDropdown.tsx`

**Features:**
- Settings gear icon
- Smooth hover animation
- 3-second delay before closing
- Dropdown menu with Change Password and Logout options
- Automatic timeout cleanup

### Backend Services

#### 1. Security Question Retrieval
**Endpoint:** `GET /api/auth/security-question?email={email}`

**Service:** `getSecurityQuestion(email: string)`

**Returns:**
```typescript
{
  success: true,
  data: {
    securityQuestion: string
  }
}
```

#### 2. Security Answer Verification
**Endpoint:** `POST /api/auth/verify-security-answer`

**Service:** `verifySecurityAnswer(email: string, securityAnswer: string)`

**Body:**
```json
{
  "email": "user@example.com",
  "securityAnswer": "their answer"
}
```

**Returns:**
```typescript
{
  success: true,
  data: {
    verified: true
  }
}
```

#### 3. Password Reset
**Endpoint:** `POST /api/auth/reset-password`

**Service:** `resetPassword(data: PasswordResetRequest)`

**Body:**
```json
{
  "email": "user@example.com",
  "securityAnswer": "their answer",
  "newPassword": "NewPassword123!"
}
```

**Validation:**
- Verifies security answer again (double verification)
- Validates new password strength
- Updates password hash in database

#### 4. Change Password (Protected)
**Endpoint:** `POST /api/auth/change-password`

**Service:** `changePassword(userId: string, currentPassword: string, newPassword: string)`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Validation:**
- Verifies current password
- Validates new password strength
- Updates password hash in database

### Database Schema

#### User Model (Prisma)
```prisma
model User {
  id                   String   @id @default(cuid())
  email                String   @unique
  passwordHash         String
  securityQuestion     String
  securityAnswerHash   String
  name                 String?
  createdAt            DateTime @default(now())
  // ... other fields
}
```

### API Service Methods

#### Frontend API Client
**Location:** `frontend/src/services/api.ts`

**Methods:**
```typescript
// Get security question
async getSecurityQuestion(email: string): Promise<ApiResponse<{ securityQuestion: string }>>

// Reset password
async resetPassword(email: string, securityAnswer: string, newPassword: string): Promise<ApiResponse<{ message: string }>>

// Change password (requires authentication)
async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>>

// Generic methods
async get(path: string): Promise<any>
async post(path: string, data: any): Promise<any>
```

## User Experience Flow

### Forgot Password (Not Logged In)

1. User clicks "Forgot password?" on login page
2. **Step 1:** Enter email → System shows security question
3. **Step 2:** Answer security question → System verifies answer
4. **Step 3:** Enter new password → System updates password
5. Success screen → Auto-redirect to login
6. User logs in with new password

### Change Password (Logged In)

1. User hovers over settings icon in dashboard
2. Click "Change Password" in dropdown
3. Modal opens with password change form
4. Enter current password (verification)
5. Enter new password
6. Confirm new password
7. Click "Change Password"
8. Success message → Modal auto-closes
9. Password updated

## Security Considerations

### Password Hashing
- Uses bcrypt with 10 salt rounds
- Passwords never stored in plain text
- One-way hashing (cannot be reversed)

### Security Answer Hashing
- Same bcrypt hashing as passwords
- Normalized before hashing (lowercase, trimmed)
- Prevents rainbow table attacks
- Cannot retrieve original answer

### JWT Authentication
- Change password requires valid JWT token
- Token expires after session
- Protected routes verify token before allowing access

### Error Messages
- Generic messages to prevent user enumeration
- "Invalid email or password" instead of "Email not found"
- "Incorrect security answer" without revealing correct answer

### No Rate Limiting (Current Implementation)
- Unlimited attempts for password reset
- No account lockout after failed attempts
- **Note:** May want to add rate limiting in production

## Code Locations

### Frontend
```
frontend/src/
├── pages/
│   ├── ForgotPassword.tsx         # 3-step password reset flow
│   ├── Login.tsx                  # Enhanced error messages + forgot password link
│   ├── Register.tsx               # Fixed security question selection
│   └── Dashboard.tsx              # Settings dropdown integration
├── components/
│   ├── ChangePasswordModal.tsx    # Password change modal
│   └── SettingsDropdown.tsx       # Settings menu with hover animation
└── services/
    └── api.ts                     # API methods for auth
```

### Backend
```
backend/src/
├── controllers/
│   └── auth.controller.ts         # Auth endpoints
├── services/
│   └── auth.service.ts            # Business logic
├── routes/
│   └── auth.routes.ts             # Route definitions
└── utils/
    └── bcrypt.ts                  # Password/answer hashing utilities
```

## Routes Summary

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/auth/security-question?email={email}` | No | Get security question by email |
| POST | `/api/auth/verify-security-answer` | No | Verify security answer |
| POST | `/api/auth/reset-password` | No | Reset password via security question |
| POST | `/api/auth/change-password` | Yes | Change password for logged-in user |
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/logout` | No | User logout (client-side) |
| GET | `/api/auth/me` | Yes | Get current user info |

## Testing Checklist

### Forgot Password Flow
- [ ] Step 1: Enter valid email → Shows correct security question
- [ ] Step 1: Enter invalid email → Shows error
- [ ] Step 2: Enter correct answer → Proceeds to Step 3
- [ ] Step 2: Enter wrong answer → Shows error, stays on Step 2
- [ ] Step 3: Passwords don't match → Shows error
- [ ] Step 3: Password too short → Shows error
- [ ] Step 3: Password missing number → Shows error
- [ ] Step 3: Password missing special char → Shows error
- [ ] Step 3: Valid password → Updates successfully
- [ ] Success screen → Auto-redirects to login
- [ ] Can login with new password

### Change Password Flow
- [ ] Settings icon shows dropdown on hover
- [ ] Dropdown stays open for 3 seconds after mouse leaves
- [ ] Click "Change Password" → Opens modal
- [ ] Wrong current password → Shows error
- [ ] Passwords don't match → Shows error
- [ ] Weak password → Shows error
- [ ] Valid password change → Success message
- [ ] Modal auto-closes after success
- [ ] Can login with new password

### Registration Security Question
- [ ] Dropdown shows "Select a security question..." placeholder
- [ ] Cannot submit without selecting a question
- [ ] Must actively choose from dropdown
- [ ] All 5 questions available
- [ ] Selected question saved correctly
- [ ] Can reset password using selected question

## Future Enhancements

### Potential Improvements
1. **Rate Limiting:** Limit password reset attempts per IP/email
2. **Email Verification:** Send email confirmation for password changes
3. **Password History:** Prevent reusing recent passwords
4. **Two-Factor Authentication:** Add 2FA option
5. **Account Lockout:** Temporary lockout after X failed attempts
6. **Security Question Rotation:** Allow users to change security questions
7. **Audit Logging:** Log all password change attempts
8. **Session Invalidation:** Invalidate all sessions on password change

## Changelog

### Version 1.0 (Current)
- ✅ Implemented 3-step linear password reset flow
- ✅ Added security question verification
- ✅ Created change password feature in settings
- ✅ Added settings dropdown with hover animation
- ✅ Fixed registration form security question selection
- ✅ Added password strength validation
- ✅ Implemented bcrypt hashing for security answers
- ✅ Added comprehensive error handling
- ✅ Created success screens with auto-redirect

## Support

For issues or questions about the password reset features:
1. Check error messages displayed in the UI
2. Verify email is registered in the system
3. Ensure security answer matches exactly (case-insensitive)
4. Check password meets strength requirements
5. Review browser console for detailed error logs

## License

Part of the Career Fit Analysis application.
