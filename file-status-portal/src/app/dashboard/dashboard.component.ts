import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, MatTableModule],
  standalone: true,
})
export class DashboardComponent implements OnInit {
  files: any[] = [];
  displayedColumns: string[] = ['name', 'status', 'result'];
  apiUrl = 'http://127.0.0.1:8000/status/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchFileStatuses();
  }

  fetchFileStatuses() {
    // Replace with actual API to fetch all files
    this.http.get<any[]>('http://127.0.0.1:8000/files/').subscribe({
      next: (data) => {
        this.files = data;
      },
      error: (error) => {
        console.error('Failed to fetch file statuses', error);
      },
    });
  }
}
