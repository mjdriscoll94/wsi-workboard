import { 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BlockedEmail } from '../types';

const BLOCKED_EMAILS_COLLECTION = 'blockedEmails';

export class BlockedEmailService {
  // Add an email address to the blocked list
  static async blockEmail(emailAddress: string, reason?: string, blockedBy?: string): Promise<string> {
    try {
      const blockedEmail: Omit<BlockedEmail, 'id'> = {
        emailAddress: emailAddress.toLowerCase().trim(),
        reason: reason || 'Marked as spam',
        blockedAt: new Date(),
        blockedBy: blockedBy || 'unknown'
      };
      
      const docRef = await addDoc(collection(db, BLOCKED_EMAILS_COLLECTION), {
        ...blockedEmail,
        blockedAt: Timestamp.fromDate(blockedEmail.blockedAt)
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error blocking email:', error);
      throw error;
    }
  }

  // Remove an email address from the blocked list
  static async unblockEmail(emailAddress: string): Promise<void> {
    try {
      const q = query(
        collection(db, BLOCKED_EMAILS_COLLECTION),
        where('emailAddress', '==', emailAddress.toLowerCase().trim())
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        await deleteDoc(docRef.ref);
      }
    } catch (error) {
      console.error('Error unblocking email:', error);
      throw error;
    }
  }

  // Check if an email address is blocked
  static async isEmailBlocked(emailAddress: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, BLOCKED_EMAILS_COLLECTION),
        where('emailAddress', '==', emailAddress.toLowerCase().trim())
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if email is blocked:', error);
      return false; // Default to not blocked if there's an error
    }
  }

  // Get all blocked email addresses
  static async getBlockedEmails(): Promise<BlockedEmail[]> {
    try {
      const querySnapshot = await getDocs(collection(db, BLOCKED_EMAILS_COLLECTION));
      const blockedEmails: BlockedEmail[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        blockedEmails.push({
          id: doc.id,
          emailAddress: data.emailAddress,
          reason: data.reason,
          blockedAt: data.blockedAt?.toDate() || new Date(),
          blockedBy: data.blockedBy
        });
      });
      
      return blockedEmails.sort((a, b) => b.blockedAt.getTime() - a.blockedAt.getTime());
    } catch (error) {
      console.error('Error getting blocked emails:', error);
      return [];
    }
  }

  // Get blocked emails by user
  static async getBlockedEmailsByUser(userId: string): Promise<BlockedEmail[]> {
    try {
      const q = query(
        collection(db, BLOCKED_EMAILS_COLLECTION),
        where('blockedBy', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const blockedEmails: BlockedEmail[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        blockedEmails.push({
          id: doc.id,
          emailAddress: data.emailAddress,
          reason: data.reason,
          blockedAt: data.blockedAt?.toDate() || new Date(),
          blockedBy: data.blockedBy
        });
      });
      
      return blockedEmails.sort((a, b) => b.blockedAt.getTime() - a.blockedAt.getTime());
    } catch (error) {
      console.error('Error getting blocked emails by user:', error);
      return [];
    }
  }
} 