# Firebase Setup Guide

## Firestore Security Rules

I've created two sets of security rules for your Gmail Task Dashboard:

### 1. Development Rules (`firestore.rules`)
- **Open access** - allows read/write to all tasks
- **Good for testing** and initial development
- **No authentication required**
- Includes data validation

### 2. Production Rules (`firestore.production.rules`)
- **Secure** - requires user authentication
- **User-specific data** - each user can only access their own tasks
- **Data validation** with size limits
- **Recommended for production use**

## How to Deploy Rules

### Option 1: Firebase Console (Recommended for beginners)

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com/
   - Select your project

2. **Navigate to Firestore**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab

3. **Copy and Paste Rules**
   - Copy the content from `firestore.rules` (for development)
   - Paste it into the rules editor
   - Click "Publish"

### Option 2: Firebase CLI (Advanced)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init firestore
   ```

4. **Deploy rules**
   ```bash
   # For development rules
   cp firestore.rules firestore.rules.backup
   firebase deploy --only firestore:rules
   
   # For production rules
   cp firestore.production.rules firestore.rules
   firebase deploy --only firestore:rules
   ```

## Rule Explanations

### Development Rules Features:
- ✅ Anyone can read/write tasks (good for testing)
- ✅ Validates task data structure
- ✅ Allows all CRUD operations
- ⚠️ Not secure for production

### Production Rules Features:
- 🔒 Requires user authentication
- 🔒 Users can only access their own tasks
- ✅ Validates data structure and sizes
- ✅ Prevents unauthorized access
- ✅ Includes userId field requirement

## Data Structure Validation

Both rule sets validate that tasks have the correct structure:

```javascript
{
  title: string (1-200 chars),
  description: string (max 2000 chars),
  priority: 'low' | 'medium' | 'high' | 'urgent',
  label: string (1-100 chars),
  completed: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  source: 'gmail' | 'manual',
  userId: string (production only)
}
```

## Testing Your Rules

### Test in Firebase Console:
1. Go to Firestore > Rules
2. Click "Rules Playground"
3. Test different scenarios:
   - Reading tasks
   - Creating tasks
   - Updating tasks
   - Deleting tasks

### Test with Your App:
1. Try creating a task
2. Try updating a task
3. Check the browser console for any permission errors

## Switching Between Rule Sets

### For Development:
- Use `firestore.rules`
- No authentication setup needed
- Good for initial testing

### For Production:
- Use `firestore.production.rules`
- Requires Firebase Authentication setup
- Much more secure

## Next Steps

1. **Start with development rules** to test your app
2. **Set up Firebase Authentication** when ready
3. **Switch to production rules** before going live
4. **Test thoroughly** in both environments

## Common Issues

### "Permission denied" errors:
- Check if rules are properly deployed
- Verify user authentication (for production rules)
- Check browser console for detailed error messages

### "Invalid document" errors:
- Ensure task data matches the required structure
- Check that all required fields are present
- Verify data types match the validation rules

Need help? Check the Firebase documentation or the browser console for detailed error messages!