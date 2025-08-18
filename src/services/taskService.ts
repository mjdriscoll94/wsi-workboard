import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Task, CreateTaskDialogData } from '../types';

const TASKS_COLLECTION = 'tasks';

// Helper function to ensure consistent task creation
const createTaskFromData = (id: string, data: any): Task => {
  const task = {
    id,
    title: data.title || '',
    description: data.description || '',
    priority: data.priority || 'medium',
    label: data.label || 'INBOX',
    category: data.category || 'UNASSIGNED',
    notes: data.notes,
    completed: data.completed || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    source: data.source || 'manual',
    gmailId: data.gmailId,
    fromEmail: data.fromEmail,
    emailSubject: data.emailSubject,
    emailSnippet: data.emailSnippet,
    accountEmail: data.accountEmail,
    lastStatusChange: data.lastStatusChange?.toDate() || data.createdAt?.toDate() || new Date(),
    snoozeUntil: data.snoozeUntil?.toDate() || undefined
  };
  
  console.log('Creating task from data:', { id, taskId: task.id, hasId: !!task.id });
  return task;
};

export class TaskService {
  // Create a new task
  static async createTask(taskData: CreateTaskDialogData): Promise<string> {
    try {
      const task: Omit<Task, 'id'> = {
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'manual'
      };
      
      const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
        ...task,
        createdAt: Timestamp.fromDate(task.createdAt),
        updatedAt: Timestamp.fromDate(task.updatedAt)
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Create task from Gmail email
  static async createTaskFromEmail(emailData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    label: string;
    category?: 'WINDSOR' | 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | 'UNASSIGNED';
    gmailId: string;
    fromEmail: string;
    emailSubject: string;
    emailSnippet: string;
    accountEmail?: string;
  }): Promise<string> {
    try {
      const task: Omit<Task, 'id'> = {
        title: emailData.title,
        description: emailData.description,
        priority: emailData.priority,
        label: emailData.label,
        category: emailData.category || 'UNASSIGNED',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'gmail',
        gmailId: emailData.gmailId,
        fromEmail: emailData.fromEmail,
        emailSubject: emailData.emailSubject,
        emailSnippet: emailData.emailSnippet,
        accountEmail: emailData.accountEmail
      };
      
      const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
        ...task,
        createdAt: Timestamp.fromDate(task.createdAt),
        updatedAt: Timestamp.fromDate(task.updatedAt)
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating task from email:', error);
      throw error;
    }
  }

  // Update a task
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      
      // Track status changes for age-based color coding
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      // If label is changing, update lastStatusChange
      if (updates.label) {
        updateData.lastStatusChange = Timestamp.fromDate(new Date());
      }
      
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get all tasks
  static async getAllTasks(): Promise<Task[]> {
    try {
      const tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push(createTaskFromData(doc.id, data));
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  // Get tasks by label
  static async getTasksByLabel(label: string): Promise<Task[]> {
    try {
      const tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where('label', '==', label),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push(createTaskFromData(doc.id, data));
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by label:', error);
      throw error;
    }
  }

  // Subscribe to real-time task updates
  static subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    const tasksQuery = query(
      collection(db, TASKS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(tasksQuery, (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push(createTaskFromData(doc.id, data));
      });
      console.log('Task subscription update:', tasks.map(t => ({ id: t.id, hasId: !!t.id })));
      callback(tasks);
    }, (error) => {
      console.error('Error in task subscription:', error);
    });
  }

  // Toggle task completion
  static async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    try {
      await this.updateTask(taskId, { completed });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }

  // Update task priority
  static async updateTaskPriority(taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<void> {
    try {
      await this.updateTask(taskId, { priority });
    } catch (error) {
      console.error('Error updating task priority:', error);
      throw error;
    }
  }

  // Update task label/section
  static async updateTaskLabel(taskId: string, label: string): Promise<void> {
    try {
      await this.updateTask(taskId, { label });
    } catch (error) {
      console.error('Error updating task label:', error);
      throw error;
    }
  }

  // Reset task creation date (for overdue timer reset)
  static async resetTaskCreationDate(taskId: string): Promise<void> {
    try {
      await this.updateTask(taskId, { createdAt: new Date() });
    } catch (error) {
      console.error('Error resetting task creation date:', error);
      throw error;
    }
  }
}