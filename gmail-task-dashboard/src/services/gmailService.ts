import { gapi } from 'gapi-script';

// Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
  internalDate: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: string;
  messagesTotal: number;
  messagesUnread: number;
}

export class GmailService {
  private static isInitialized = false;
  private static connectedAccounts: Map<string, any> = new Map();
  private static tokenClient: any = null;
  private static accessToken: string | null = null;
  private static currentAccountEmail: string | null = null;

  // Initialize the Gmail API with new Google Identity Services
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if we have valid API credentials
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    console.log('API Configuration check:', {
      hasApiKey: !!apiKey,
      hasClientId: !!clientId,
      apiKeyStart: apiKey?.substring(0, 10) + '...',
      clientIdStart: clientId?.substring(0, 20) + '...'
    });
    
    if (!apiKey || !clientId || 
        apiKey === 'demo-api-key' || 
        clientId === 'demo-client-id') {
      throw new Error('Google API credentials not configured. Please set up your API key and client ID in .env.local');
    }

    try {
      // Wait for Google Identity Services to load
      await new Promise<void>((resolve, reject) => {
        const checkGoogleLoaded = () => {
          if (window.google && window.google.accounts) {
            resolve();
          } else {
            setTimeout(checkGoogleLoaded, 100);
          }
        };
        checkGoogleLoaded();
      });

      // Load the Google API client
      await new Promise<void>((resolve, reject) => {
        if (typeof gapi === 'undefined') {
          reject(new Error('Google API library not loaded. Please check your internet connection.'));
          return;
        }
        gapi.load('client', {
          callback: resolve,
          onerror: () => reject(new Error('Failed to load Google API client'))
        });
      });

      // Initialize the client
      await gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: [DISCOVERY_DOC]
      });

      // Initialize the OAuth2 token client (new way)
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          console.log('Token received:', tokenResponse);
          this.accessToken = tokenResponse.access_token;
          gapi.client.setToken({ access_token: tokenResponse.access_token });
        },
      });

      this.isInitialized = true;
      console.log('Gmail API initialized successfully with new Google Identity Services');
    } catch (error) {
      console.error('Error initializing Gmail API:', error);
      throw error;
    }
  }

  // Sign in to Google using new Google Identity Services
  static async signIn(prompt: 'select_account' | 'consent' | '' = 'select_account'): Promise<boolean> {
    try {
      console.log('Initializing Gmail service...');
      await this.initialize();
      
      if (!this.tokenClient) {
        throw new Error('Token client not initialized. Please check your API configuration.');
      }
      
      console.log('Starting sign-in process with new Google Identity Services...');
      
      // Use the new Google Identity Services token client
      return new Promise<boolean>((resolve, reject) => {
        try {
          this.tokenClient.callback = (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.error('Token error:', tokenResponse);
              reject(new Error(`Authentication failed: ${tokenResponse.error}`));
              return;
            }
            
            console.log('Successfully received access token');
            this.accessToken = tokenResponse.access_token;
            gapi.client.setToken({ access_token: tokenResponse.access_token });
            this.currentAccountEmail = null; // reset; will fetch on demand
            
            // For now, we'll mark as successful - we can get user info later if needed
            resolve(true);
          };
          
          // Request access token
          this.tokenClient.requestAccessToken({
            prompt: prompt === 'consent' ? 'consent' : 'select_account'
          });
        } catch (error) {
          console.error('Error in token client:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error signing in to Gmail:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      // Provide more specific error information
      if (error && typeof error === 'object' && 'error' in error) {
        const googleError = error as any;
        console.error('Google error type:', googleError.error);
        console.error('Google error details:', googleError.details);
        
        if (googleError.error === 'server_error') {
          throw new Error('Gmail API server error. This usually means: 1) OAuth consent screen needs verification, 2) App is in "Testing" mode but user not added as test user, 3) Gmail API quotas exceeded. Check your Google Cloud Console.');
        }
        if (googleError.error === 'access_denied') {
          throw new Error('Access denied. Please grant permission to access Gmail.');
        }
        if (googleError.error === 'invalid_client') {
          throw new Error('Invalid client configuration. Check your Google API credentials in .env.local file.');
        }
      }
      
      throw error; // Re-throw original error if not a known Google error
    }
  }

  // Add additional account
  static async addAccount(): Promise<string | null> {
    try {
      const success = await this.signIn('select_account');
      if (success) {
        const email = this.getUserEmail();
        console.log('Added account:', email);
        return email;
      }
      return null;
    } catch (error) {
      console.error('Error adding account:', error);
      return null;
    }
  }

  // Get all connected accounts
  static getConnectedAccounts(): string[] {
    return Array.from(this.connectedAccounts.keys());
  }

  // Switch to specific account
  static async switchAccount(email: string): Promise<boolean> {
    try {
      const user = this.connectedAccounts.get(email);
      if (user) {
        // This would require additional implementation to switch context
        console.log('Switching to account:', email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error switching account:', error);
      return false;
    }
  }

  // Sign out from Google
  static async signOut(): Promise<void> {
    try {
      // With the new Google Identity Services, we just clear the token
      this.accessToken = null;
      gapi.client.setToken(null);
      this.connectedAccounts.clear();
      console.log('Successfully signed out from Gmail');
    } catch (error) {
      console.error('Error signing out from Gmail:', error);
      throw error;
    }
  }

  // Check if user is signed in
  static isSignedIn(): boolean {
    try {
      if (!this.isInitialized) return false;
      return !!this.accessToken && !!gapi.client.getToken();
    } catch (error) {
      return false;
    }
  }

  // Get user email
  static getUserEmail(): string | null {
    try {
      return this.currentAccountEmail;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  // Actively fetch the current signed-in account's email from Gmail profile
  static async getActiveAccountEmail(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      const resp = await gapi.client.request({
        path: 'https://gmail.googleapis.com/gmail/v1/users/me/profile'
      });
      const email = resp.result?.emailAddress || null;
      this.currentAccountEmail = email;
      if (email) {
        this.connectedAccounts.set(email, { email });
      }
      return email;
    } catch (e) {
      console.warn('Unable to fetch active account email:', e);
      return null;
    }
  }

  // Get Gmail labels
  static async getLabels(): Promise<GmailLabel[]> {
    try {
      await this.initialize();
      const response = await gapi.client.request({
        path: 'https://gmail.googleapis.com/gmail/v1/users/me/labels'
      });
      
      return response.result.labels || [];
    } catch (error) {
      console.error('Error getting Gmail labels:', error);
      throw error;
    }
  }

  // Get messages by label with optional date filtering
  static async getMessagesByLabel(
    labelId: string, 
    maxResults: number = 500, 
    newerThan?: Date
  ): Promise<GmailMessage[]> {
    try {
      await this.initialize();
      
      // Build query parameters
      const params: any = {
        labelIds: labelId,
        maxResults: maxResults.toString()
      };

      // Add date filter if provided
      if (newerThan) {
        // Convert to Gmail search query format (YYYY/MM/DD)
        // Subtract one day to make the search inclusive (Gmail's 'after' is exclusive)
        const adjustedDate = new Date(newerThan);
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        const dateStr = adjustedDate.toISOString().split('T')[0].replace(/-/g, '/');
        params.q = `after:${dateStr}`;
        console.log(`Gmail sync: Searching for emails after ${dateStr} (original date: ${newerThan.toISOString().split('T')[0]})`);
      }
      
      // First, get the list of message IDs
      const listResponse = await gapi.client.request({
        path: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        params
      });

      if (!listResponse.result.messages) {
        console.log(`Gmail sync: No messages found for label ${labelId} with query params:`, params);
        return [];
      }
      
      console.log(`Gmail sync: Found ${listResponse.result.messages.length} messages for label ${labelId} (limit: ${maxResults})`);
      
      if (listResponse.result.messages.length >= maxResults) {
        console.warn(`Gmail sync: Hit message limit (${maxResults}) for label ${labelId} - there may be more emails`);
      }

      // Then, get full message details for each message
      const messages: GmailMessage[] = [];
      for (const messageRef of listResponse.result.messages) {
        try {
          const messageResponse = await gapi.client.request({
            path: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}`,
            params: {
              format: 'full'
            }
          });
          messages.push(messageResponse.result);
        } catch (error) {
          console.error(`Error fetching message ${messageRef.id}:`, error);
        }
      }

      return messages;
    } catch (error) {
      console.error('Error getting messages by label:', error);
      throw error;
    }
  }

  // Get new messages since last sync
  static async getNewMessagesSince(
    labelIds: string[], 
    lastSyncTime: Date,
    maxResults: number = 500
  ): Promise<GmailMessage[]> {
    try {
      const allNewMessages: GmailMessage[] = [];
      
      for (const labelId of labelIds) {
        const messages = await this.getMessagesByLabel(labelId, maxResults, lastSyncTime);
        
        // Filter messages to only include those from lastSyncTime onwards (inclusive)
        const filteredMessages = messages.filter(message => {
          const messageDate = new Date(parseInt(message.internalDate));
          return messageDate >= lastSyncTime;
        });
        
        allNewMessages.push(...filteredMessages);
      }

      // Remove duplicates based on message ID and sort by date (newest first)
      const uniqueMessages = allNewMessages
        .filter((message, index, self) =>
          index === self.findIndex(m => m.id === message.id)
        )
        .sort((a, b) => parseInt(b.internalDate) - parseInt(a.internalDate));

      return uniqueMessages;
    } catch (error) {
      console.error('Error getting new messages since last sync:', error);
      throw error;
    }
  }

  // Get messages by multiple labels
  static async getMessagesByLabels(labelIds: string[], maxResults: number = 50): Promise<GmailMessage[]> {
    try {
      const allMessages: GmailMessage[] = [];
      
      for (const labelId of labelIds) {
        const messages = await this.getMessagesByLabel(labelId, maxResults);
        allMessages.push(...messages);
      }

      // Remove duplicates based on message ID
      const uniqueMessages = allMessages.filter((message, index, self) =>
        index === self.findIndex(m => m.id === message.id)
      );

      return uniqueMessages;
    } catch (error) {
      console.error('Error getting messages by labels:', error);
      throw error;
    }
  }

  // Parse email headers
  static parseHeaders(headers: Array<{ name: string; value: string }>): {
    subject: string;
    from: string;
    to: string;
    date: string;
  } {
    const headerMap = headers.reduce((acc, header) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      subject: headerMap['subject'] || '',
      from: headerMap['from'] || '',
      to: headerMap['to'] || '',
      date: headerMap['date'] || ''
    };
  }

  // Extract email body text
  static extractBodyText(message: GmailMessage): string {
    try {
      let bodyData = '';

      if (message.payload.body?.data) {
        bodyData = message.payload.body.data;
      } else if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            bodyData = part.body.data;
            break;
          }
        }
      }

      if (bodyData) {
        // Decode base64url
        const decoded = atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
        return decoded;
      }

      return message.snippet || '';
    } catch (error) {
      console.error('Error extracting body text:', error);
      return message.snippet || '';
    }
  }

  // Convert Gmail message to task data
  static convertMessageToTask(message: GmailMessage, defaultLabel: string, accountEmail?: string): {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    label: string;
    gmailId: string;
    fromEmail: string;
    emailSubject: string;
    emailSnippet: string;
    accountEmail?: string;
  } {
    const headers = this.parseHeaders(message.payload.headers);
    const bodyText = this.extractBodyText(message);
    
    // Determine priority based on keywords or labels
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    const subjectLower = headers.subject.toLowerCase();
    
    if (subjectLower.includes('urgent') || subjectLower.includes('asap')) {
      priority = 'urgent';
    } else if (subjectLower.includes('important') || subjectLower.includes('priority')) {
      priority = 'high';
    } else if (subjectLower.includes('fyi') || subjectLower.includes('reminder')) {
      priority = 'low';
    }

    // Try to infer the account email from the From header if available (best-effort)
    // In multi-account scenarios we can also store the active connected account separately.
    const accountEmailGuess = accountEmail || (headers.to || '').split(/[\s,<>]/).find(p => p.includes('@')) || undefined;

    return {
      title: headers.subject || 'No Subject',
      description: bodyText.substring(0, 500) + (bodyText.length > 500 ? '...' : ''),
      priority,
      label: defaultLabel,
      gmailId: message.id,
      fromEmail: headers.from,
      emailSubject: headers.subject,
      emailSnippet: message.snippet,
      accountEmail: accountEmailGuess
    };
  }
}