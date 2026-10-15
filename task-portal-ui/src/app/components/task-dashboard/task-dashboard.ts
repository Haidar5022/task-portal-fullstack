import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './task-dashboard.html',
  styleUrl: './task-dashboard.css'
})
export class TaskDashboardComponent implements OnInit {
  taskForm: FormGroup;
  tasks: Task[] = [];
  displayedColumns: string[] = ['id', 'title', 'assignedTo', 'status', 'actions'];

  dataSource = new MatTableDataSource<Task>([]);
  selectedStatus: string = 'ALL';
  searchQuery: string = '';

  isEditMode: boolean = false;
  editingTaskId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      assignedTo: ['', Validators.required],
      status: ['PENDING' as TaskStatus, Validators.required]
    });
  }

  ngOnInit(): void {
    this.setupFilter();
    this.loadTasks();
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  setupFilter(): void {
    this.dataSource.filterPredicate = (task: Task, filter: string) => {
      const titleMatch = (task.title || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const assignedMatch = (task.assignedTo || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesSearch = titleMatch || assignedMatch;
      const matchesStatus = this.selectedStatus === 'ALL' || task.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    };
  }

  applyFilter(): void {
    this.dataSource.filter = `${this.searchQuery.trim()}_${this.selectedStatus}`;
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.dataSource.data = [...this.tasks];
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.showNotification('Error loading tasks!');
      }
    });
  }

  startEdit(task: Task): void {
    this.isEditMode = true;
    this.editingTaskId = task.id !== undefined ? task.id : null;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo,
      status: task.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingTaskId = null;
    this.taskForm.reset({ status: 'PENDING' });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.editingTaskId !== null) {
      const payload: Task = {
        id: this.editingTaskId,
        ...this.taskForm.value
      };

      this.taskService.updateTask(this.editingTaskId, payload).subscribe({
        next: (updatedTask) => {
          this.tasks = this.tasks.map((t) => (t.id === this.editingTaskId ? updatedTask : t));
          this.dataSource.data = [...this.tasks];
          this.applyFilter();
          this.cancelEdit();
          this.showNotification('Task updated successfully!');
        },
        error: (err) => {
          console.error('Update Task Error:', err);
          this.showNotification('Failed to update task.');
        }
      });
    } else {
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: (newTask) => {
          this.tasks = [newTask, ...this.tasks];
          this.dataSource.data = [...this.tasks];
          this.applyFilter();
          this.taskForm.reset({ status: 'PENDING' });
          this.showNotification('Task created successfully!');
        },
        error: (err) => {
          console.error('Create Task Error:', err);
          this.showNotification('Failed to create task.');
        }
      });
    }
  }

  onStatusChange(taskId: number | undefined, newStatus: TaskStatus): void {
    if (!taskId) return;

    this.taskService.updateStatus(taskId, newStatus).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) => (t.id === taskId ? (updated || { ...t, status: newStatus }) : t));
        this.dataSource.data = [...this.tasks];
        this.applyFilter();
        this.showNotification(`Status updated to ${newStatus}`);
      },
      error: (err) => {
        console.error('Status Update Error:', err);
        this.showNotification('Failed to update status.');
      }
    });
  }

  deleteTask(id: number | undefined): void {
    if (!id) return;

    if (confirm(`Are you sure you want to delete task #${id}?`)) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter((t) => t.id !== id);
          this.dataSource.data = [...this.tasks];
          this.applyFilter();
          if (this.editingTaskId === id) {
            this.cancelEdit();
          }
          this.showNotification('Task deleted successfully!');
        },
        error: (err) => {
          console.error('Delete Task Error:', err);
          this.showNotification('Failed to delete task.');
        }
      });
    }
  }
}