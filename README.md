# Gmail Task Dashboard

A modern React dashboard that integrates with Gmail to transform emails into manageable tasks. Built with React, TypeScript, Material-UI, and Firebase.

## Features

- 🎯 **Gmail Integration**: Import emails from specific Gmail labels as tasks
- 📧 **Multi-Account Support**: Connect multiple Gmail accounts
- 🏷️ **Smart Organization**: Organize tasks by email labels and priority levels
- ✅ **Task Management**: Create, edit, complete, and delete tasks
- 🎨 **Drag & Drop**: Move tasks between sections with intuitive drag-and-drop
- 🔄 **Real-time Updates**: Firebase Firestore integration for live data sync
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🔒 **Secure**: OAuth2 authentication for Gmail access

## Priority Levels

- 🔴 **Urgent**: Critical tasks requiring immediate attention
- 🟠 **High**: Important tasks with deadlines
- 🔵 **Medium**: Standard tasks (default)
- 🟢 **Low**: Nice-to-have tasks

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project
- Google Cloud Console project with Gmail API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gmail-task-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase config from Project Settings

4. **Set up Google Gmail API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create credentials (OAuth 2.0 Client ID)
   - Add your domain to authorized origins

5. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id

   # Google API Configuration
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_GOOGLE_API_KEY=your_google_api_key
   ```

6. **Start the development server**
   ```bash
   npm start
   ```

## Usage

### First Time Setup

1. **Connect Gmail**: Click "Connect Gmail" in the top bar
2. **Authorize**: Sign in to your Google account and grant permissions
3. **Sync Emails**: Click "Sync Gmail" to import emails as tasks

### Creating Manual Tasks

1. Click the "+" floating action button
2. Fill in the task details:
   - **Title**: Brief description of the task
   - **Description**: Detailed information
   - **Priority**: Low, Medium, High, or Urgent
   - **Label**: Section where the task belongs
   - **Notes**: Additional information (optional)

### Managing Tasks

- **Complete Tasks**: Check the checkbox to mark as complete
- **Change Priority**: Click the three-dot menu on any task
- **Move Tasks**: Drag and drop between sections
- **Delete Tasks**: Use the three-dot menu

### Gmail Integration

The dashboard automatically:
- Imports emails from your selected Gmail labels
- Converts email subjects to task titles
- Uses email content as task descriptions
- Assigns priority based on keywords (urgent, important, etc.)
- Creates tasks with Gmail metadata for reference

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── TaskSection.tsx        # Task section container
│   ├── TaskCard.tsx           # Individual task card
│   ├── CreateTaskDialog.tsx   # Manual task creation dialog
│   └── GmailSetupDialog.tsx   # Gmail connection dialog
├── services/
│   ├── taskService.ts         # Firebase task operations
│   └── gmailService.ts        # Gmail API integration
├── firebase/
│   └── config.ts              # Firebase configuration
├── types/
│   └── index.ts               # TypeScript type definitions
└── App.tsx                    # Main application component
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (not recommended)

## Technologies Used

- **Frontend**: React 19, TypeScript, Material-UI
- **Backend**: Firebase Firestore
- **APIs**: Gmail API, Google OAuth2
- **Drag & Drop**: react-beautiful-dnd
- **Date Handling**: date-fns
- **Styling**: Material-UI with custom theme

## Security & Privacy

- OAuth2 authentication ensures secure Gmail access
- Only email metadata and content are accessed for task creation
- No emails are stored permanently; only task data is saved to Firebase
- All data remains in your Firebase project under your control

## Troubleshooting

### Common Issues

1. **Gmail API Errors**: Ensure Gmail API is enabled in Google Cloud Console
2. **OAuth Issues**: Check that your domain is in authorized origins
3. **Firebase Connection**: Verify all environment variables are set correctly
4. **Dependency Conflicts**: Use `--legacy-peer-deps` flag when installing

### Support

For issues and questions:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Ensure Firebase and Google Cloud services are properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.