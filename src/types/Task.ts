/**
 * Types relacionados a tarefas
 */

export type TaskCategory = 'LIMPEZA' | 'ORGANIZACAO' | 'ESTUDOS' | 'CUIDADOS' | 'OUTRAS';

export type TaskStatus = 'ACTIVE' | 'INACTIVE';

export type AssignmentStatus = 'PENDING' | 'COMPLETED' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  coinValue: number;
  xpValue: number;
  category: TaskCategory;
  status: TaskStatus;
  familyId: string;
  createdByName: string;
  createdAt: string;
}

export interface TaskAssignment {
  id: string;
  task: Task;
  childId: string;
  childName: string;
  status: AssignmentStatus;
  completedAt: string | null;
  approvedAt: string | null;
  approvedByName: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export type RecurrenceType = 'DAILY' | 'WEEKLY';

export interface CreateTaskData {
  title: string;
  description?: string;
  coinValue: number;
  xpValue: number;
  category: TaskCategory;
  childrenIds: string[];
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: string; // "MON,WED,FRI"
  recurrenceEndDate?: string; // ISO date
}

export interface RejectTaskData {
  rejectionReason: string;
}
