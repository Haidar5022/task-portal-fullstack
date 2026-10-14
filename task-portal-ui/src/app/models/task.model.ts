export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
}