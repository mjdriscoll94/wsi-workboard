# Google API Setup Guide

## 🚀 Getting Your Google API Key and Client ID

Follow these step-by-step instructions to get the credentials needed for Gmail integration.

## Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `gmail-task-dashboard` (or your preferred name)
   - Click "Create"
   - Wait for project creation (takes ~30 seconds)

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

## Step 2: Enable Gmail API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"
   - Or use this direct link: https://console.cloud.google.com/apis/library

2. **Find Gmail API**
   - Search for "Gmail API" in the search box
   - Click on "Gmail API" from the results

3. **Enable the API**
   - Click the blue "Enable" button
   - Wait for it to be enabled (takes a few seconds)

## Step 3: Create API Key

1. **Go to Credentials**
   - Click "APIs & Services" > "Credentials" in the left sidebar
   - Or use this direct link: https://console.cloud.google.com/apis/credentials

2. **Create API Key**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "API key"
   - A popup will show your new API key
   - **Copy this key** - you'll need it for `.env.local`

3. **Restrict the API Key (Recommended)**
   - Click "Restrict Key" in the popup
   - Under "API restrictions":
     - Select "Restrict key"
     - Check "Gmail API"
   - Under "Application restrictions" (optional but recommended):
     - Select "HTTP referrers (web sites)"
     - Add `http://localhost:3000/*` for development
     - Add your production domain when ready
   - Click "Save"

## Step 4: Create OAuth 2.0 Client ID

1. **Configure OAuth Consent Screen** (if not done already)
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless you have Google Workspace)
   - Fill in required fields:
     - **App name**: Gmail Task Dashboard
     - **User support email**: Your email
     - **Developer contact email**: Your email
   - Click "Save and Continue"
   - Skip "Scopes" for now (click "Save and Continue")
   - Skip "Test users" for now (click "Save and Continue")
   - Review and click "Back to Dashboard"

2. **Create OAuth Client ID**
   - Go back to "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Choose "Web application"
   - Enter name: `Gmail Task Dashboard Web Client`

3. **Configure Authorized Origins**
   - Under "Authorized JavaScript origins", click "Add URI"
   - Add: `http://localhost:3000`
   - Add: `http://127.0.0.1:3000` (backup)
   - For production, add your actual domain (e.g., `https://yourdomain.com`)

4. **Configure Authorized Redirect URIs** (if needed)
   - This is usually not needed for client-side apps
   - But you can add `http://localhost:3000` if required

5. **Get Your Credentials**
   - Click "Create"
   - **Copy the Client ID** - you'll need this for `.env.local`
   - You can ignore the Client Secret for frontend apps

## Step 5: Configure Your Environment

1. **Create `.env.local` file** in your project root:
   ```bash
   # In the gmail-task-dashboard directory
   touch .env.local
   ```

2. **Add your credentials to `.env.local`**:
   ```env
   # Replace with your actual values
   REACT_APP_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
   REACT_APP_GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   
   # Firebase config (get these from Firebase Console)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

## Step 6: Test Your Setup

1. **Restart your development server**:
   ```bash
   # Stop current server (Ctrl+C) then:
   npm start
   ```

2. **Test Gmail Connection**:
   - Go to http://localhost:3000
   - Click "Connect Gmail"
   - You should see Google's sign-in popup
   - Grant permissions when prompted
   - Your Gmail account should connect successfully

## 🔍 Finding Your Credentials Later

### To Find Your API Key:
1. Go to https://console.cloud.google.com/apis/credentials
2. Look under "API Keys" section
3. Click on your key to view/edit it

### To Find Your Client ID:
1. Go to https://console.cloud.google.com/apis/credentials
2. Look under "OAuth 2.0 Client IDs" section
3. Click on your client ID to view details

## 🚨 Security Notes

### For Development:
- ✅ Use `http://localhost:3000` in authorized origins
- ✅ Restrict API key to Gmail API only
- ✅ Keep credentials in `.env.local` (never commit to git)

### For Production:
- 🔒 Update authorized origins to your production domain
- 🔒 Use HTTPS only (`https://yourdomain.com`)
- 🔒 Enable additional security restrictions
- 🔒 Consider using environment-specific projects

## 💡 Pro Tips

1. **Multiple Environments**: Create separate Google Cloud projects for development and production
2. **Team Sharing**: Share the project with team members through Google Cloud Console
3. **Monitoring**: Use Google Cloud Console to monitor API usage and quotas
4. **Backup**: Save your credentials securely (password manager, encrypted notes)

## 🐛 Troubleshooting

### "API key not valid" error:
- Check that Gmail API is enabled
- Verify API key restrictions
- Ensure key is copied correctly

### "Invalid client ID" error:
- Check authorized JavaScript origins
- Verify client ID is copied correctly
- Make sure you're using the web client ID, not Android/iOS

### "Access blocked" error:
- Complete OAuth consent screen setup
- Add test users if using "External" user type
- Verify app is not restricted

## 📞 Need Help?

- **Google Cloud Console**: https://console.cloud.google.com/
- **Gmail API Documentation**: https://developers.google.com/gmail/api
- **OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2

Once you have these credentials, your Gmail Task Dashboard will be able to connect to Gmail and import emails as tasks! 🎉