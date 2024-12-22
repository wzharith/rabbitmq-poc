import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileStatusService, FileStatus } from '../services/file-status.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
selector: 'app-dashboard',
templateUrl: './dashboard.component.html',
styleUrls: ['./dashboard.component.css'],
imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {
files: FileStatus[] = [];
displayedColumns: string[] = ['name', 'status', 'result'];
isLoading = false;
error: string | null = null;
private destroy$ = new Subject<void>();

constructor(private fileStatusService: FileStatusService) {}

ngOnInit(): void {
    // Subscribe to service observables
    this.fileStatusService.files$
    .pipe(takeUntil(this.destroy$))
    .subscribe(files => this.files = files);

    this.fileStatusService.loading$
    .pipe(takeUntil(this.destroy$))
    .subscribe(loading => this.isLoading = loading);

    this.fileStatusService.error$
    .pipe(takeUntil(this.destroy$))
    .subscribe(error => this.error = error);

    // Start polling
    this.fileStatusService.startPolling();
}

refresh(): void {
    this.fileStatusService.stopPolling();
    this.fileStatusService.startPolling();
}

ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.fileStatusService.stopPolling();
}
}
