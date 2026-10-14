import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
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
    this.loadTasks();
  }

  private showNotification(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => (this.tasks = data),
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.showNotification('Error loading tasks!');
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.createTask(this.taskForm.value).subscribe({
      next: (newTask) => {
        this.tasks = [...this.tasks, newTask];
        this.taskForm.reset({ status: 'PENDING' });
        this.showNotification('Task created successfully!');
      },
      error: (err) => {
        console.error('Failed to create task', err);
        this.showNotification('Failed to create task.');
      }
    });
  }

  changeStatus(task: Task, newStatus: TaskStatus): void {
    if (!task.id) return;
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) => (t.id === updated.id ? updated : t));
        this.showNotification(`Task marked as ${newStatus}`);
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.showNotification('Failed to update task status.');
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.showNotification('Task deleted successfully!');
      },
      error: (err) => {
        console.error('Failed to delete task', err);
        this.showNotification('Failed to delete task.');
      }
    });
  }
  onStatusChange(taskId: number, newStatus: TaskStatus): void {
  this.taskService.updateStatus(taskId, newStatus).subscribe({
    next: () => {
      // Screen par local task list me status update karo
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
      }
      this.snackBar.open('Status updated successfully!', 'Close', { duration: 2000 });
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Failed to update status', 'Close', { duration: 2500 });
    }
  });
}
}