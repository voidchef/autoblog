# OAuth Authentication Setup Guide

This guide explains how to set up Google and Apple OAuth authentication.

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in application details:
   - App name: Your App Name
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Save and continue

### 3. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5173
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/v1/auth/google/callback
   ```
   
   For production, add:
   ```
   https://yourdomain.com/v1/auth/google/callback
   ```

5. Click **CREATE**
6. Copy the **Client ID** and **Client Secret**
7. Add them to your backend `.env` file

### 4. Important Notes for Google OAuth

- Use `http://` (not `https://`) for localhost
- Port numbers must match exactly (`3000` for backend, `5173` for frontend)
- No trailing slashes in URLs
- Changes may take a few minutes to propagate
- The callback URL must point to your **backend server**, not frontend

## Apple OAuth Setup

### 1. Apple Developer Account Requirements

- Active Apple Developer Program membership ($99/year)
- Access to [Apple Developer Portal](https://developer.apple.com/)

### 2. Register Your App ID

1. Go to **Certificates, Identifiers & Profiles**
2. Select **Identifiers** > Click **+** button
3. Choose **App IDs** > **App**
4. Register Bundle ID (e.g., `com.yourapp.service`)
5. Enable **Sign In with Apple** capability

### 3. Create a Services ID

1. Go to **Identifiers** > Click **+**
2. Choose **Services IDs**
3. Create a new Services ID (e.g., `com.yourapp.service`)
4. Enable **Sign In with Apple**
5. Configure:
   - Primary App ID: Your registered App ID
   - Website URLs: `https://yourapp.com`
   - Return URLs: 
     - `https://localhost:3000/v1/auth/apple/callback` (development)
     - `https://yourdomain.com/v1/auth/apple/callback` (production)

### 4. Create a Private Key

1. Go to **Keys** > Click **+**
2. Enable **Sign In with Apple**
3. Configure the key with your App ID
4. Download the `.p8` file (e.g., `AuthKey_ABC123DEF4.p8`)
5. Save to your project root
6. Note the **Key ID** (10-character string)

### 5. Get Your Team ID

1. Go to **Membership** in Apple Developer Portal
2. Copy your **Team ID** (10-character string)

### 6. Update Environment Variables

Add to your backend `.env` file:

```bash
APPLE_CLIENT_ID=com.yourapp.service
APPLE_TEAM_ID=ABC123DEF4
APPLE_KEY_ID=XYZ789GHI0
APPLE_PRIVATE_KEY_PATH=./AuthKey_XYZ789GHI0.p8
```

### 7. Apple OAuth Development Tips

1. Apple OAuth requires HTTPS even in development
2. For local development with HTTPS, use tools like [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 3000
   ```
   Then update your Apple Services ID return URL to the ngrok HTTPS URL
