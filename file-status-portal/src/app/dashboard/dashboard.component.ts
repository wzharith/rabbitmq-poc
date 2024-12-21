import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError } from 'rxjs/operators';

interface FileStatus {
name: string;
status: string;
result: string;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
standalone: true,
})
export class DashboardComponent implements OnInit {
files: FileStatus[] = [];
displayedColumns: string[] = ['name', 'status', 'result'];
apiUrl = 'http://127.0.0.1:8000/status/';
isLoading = false;
error: string | null = null;
  constructor(private http: HttpClient) {}

ngOnInit() {
this.fetchFileStatuses();
}


refresh(): void {
this.fetchFileStatuses();
}

fetchFileStatuses() {
this.isLoading = true;
this.error = null;

this.http.get<FileStatus[]>('http://127.0.0.1:8000/files/')
    .pipe(
    catchError((error: HttpErrorResponse) => {
        this.error = 'Failed to fetch file statuses. Please try again.';
        console.error('Failed to fetch file statuses', error);
        throw error;
    })
    )
    .subscribe({
    next: (data) => {
        this.files = data;
        this.isLoading = false;
    },
    error: () => {
        this.isLoading = false;
    }
    });
}
}
