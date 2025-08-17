# Multiple Gmail Accounts Guide

## 🔑 **How One API Key Supports Multiple Accounts**

### **The Short Answer:**
You only need **ONE** Google API key and client ID to support multiple Gmail accounts. Google's OAuth2 system handles multiple account authentication automatically.

### **How It Works:**

1. **Single API Project**: Your Google Cloud Console project contains ONE set of credentials
2. **OAuth2 Flow**: Each user can sign into multiple Google accounts through the same app
3. **Account Selection**: Google shows an account picker when users want to add accounts
4. **Token Management**: Each account gets its own access/refresh tokens
5. **Context Switching**: Your app can switch between accounts programmatically

## 🏗️ **Technical Implementation**

### **Environment Variables (Still Only Need One Set):**
```env
# Single API key works for all accounts
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your_api_key
```

### **OAuth2 Scopes:**
The same scopes apply to all accounts:
- `https://www.googleapis.com/auth/gmail.readonly`
- Access to read emails and labels from any connected account

### **Account Management Flow:**
```
1. User clicks "Connect Gmail" → First account auth
2. User clicks "Add Account" → Account picker appears
3. User selects different Google account → Second account auth
4. App now has access to both accounts
5. User can switch between accounts in the UI
```

## 🎯 **Updated Features**

### **New Components Added:**
- **`AccountManager.tsx`** - Manage multiple connected accounts
- **Enhanced `GmailService`** - Support for multiple account storage
- **Account Switcher** - Click on email in header to manage accounts

### **Multi-Account Capabilities:**
✅ **Add Multiple Accounts** - Users can connect several Gmail accounts
✅ **Account Switching** - Switch between accounts without re-auth
✅ **Visual Indicators** - See which account is currently active
✅ **Account Management** - Remove accounts, see all connected accounts

## 🚀 **User Experience**

### **Adding First Account:**
1. Click "Connect Gmail"
2. Sign into Google account
3. Grant permissions
4. Start syncing emails

### **Adding Additional Accounts:**
1. Click on email in header (after first account is connected)
2. Click "Add Another Gmail Account"
3. Google shows account picker
4. Select different account or "Use another account"
5. Grant permissions for new account
6. Switch between accounts as needed

### **Account Switching:**
1. Click on current email in header
2. View all connected accounts
3. Click "Switch" next to desired account
4. App context changes to selected account

## 🔒 **Security & Privacy**

### **Token Storage:**
- Each account gets separate OAuth tokens
- Tokens are managed by Google's authentication library
- No passwords stored locally

### **Permissions:**
- Each account must individually grant permissions
- Users can revoke access per account in Google settings
- App only accesses what user explicitly allows

### **Data Isolation:**
- Tasks can be tagged with source account
- Option to keep account data separate or merged
- Clear indicators of which account data comes from

## 📱 **UI Changes**

### **Header Updates:**
- Current email becomes clickable button
- Account icon indicates multiple account support
- Quick access to account management

### **Account Manager Dialog:**
- List of all connected accounts
- Active account indicator
- Add/remove account buttons
- Switch account functionality

## 🛠️ **Implementation Notes**

### **Current Limitations:**
- Google's JS API has some limitations with true multi-account switching
- Some features may require page refresh when switching accounts
- Advanced multi-account features would need server-side implementation

### **Recommended Approach:**
1. **Start Simple**: Use basic account switching
2. **Enhance Gradually**: Add more sophisticated multi-account features
3. **Consider Server-Side**: For production apps with many users

### **Future Enhancements:**
- Store account preferences in Firebase
- Account-specific task filtering
- Bulk operations across accounts
- Advanced account management features

## 🎯 **Best Practices**

### **For Development:**
1. Test with multiple personal Google accounts
2. Verify account switching works correctly
3. Check token refresh behavior
4. Test permission revocation scenarios

### **For Production:**
1. Clear user documentation about multi-account features
2. Graceful handling of account permission changes
3. Regular token validation and refresh
4. User-friendly error messages for account issues

## ❓ **Common Questions**

**Q: Do I need separate API keys for each account?**
A: No! One API key/client ID works for unlimited user accounts.

**Q: How many accounts can users connect?**
A: Technically unlimited, but UX considerations suggest 3-5 practical limit.

**Q: What happens if a user revokes access?**
A: That specific account becomes inaccessible, other accounts unaffected.

**Q: Can accounts have different permission levels?**
A: Yes, each account grants permissions independently.

**Q: How does billing work with multiple accounts?**
A: Gmail API quotas apply to your project, not per user account.

This multi-account system provides a professional-grade experience while keeping the implementation manageable! 🚀