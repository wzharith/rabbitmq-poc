import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, interval, Observable } from 'rxjs';
import {
  takeUntil,
  switchMap,
  retry,
  catchError,
  share,
  tap,
} from 'rxjs/operators';

export interface FileStatus {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileStatusService implements OnDestroy {
  private readonly API_URL = 'http://127.0.0.1:8000/files/';
  private readonly POLLING_INTERVAL = 3000; // 5 seconds

  private destroy$ = new Subject<void>();
  private polling$ = new Subject<void>();

  private filesSubject = new BehaviorSubject<FileStatus[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  files$ = this.filesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Track active polling
  private isPolling = false;

  constructor(private http: HttpClient) {}

  startPolling(): void {
    // Prevent multiple polling subscriptions
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    // Create polling observable with error handling and retry logic
    interval(this.POLLING_INTERVAL)
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(this.polling$),
        switchMap(() =>
          this.fetchFileStatus().pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, retryCount - 1) * 1000;
                console.warn(`Retry attempt ${retryCount} after ${delay}ms`);
                return interval(delay);
              },
            })
          )
        ),
        share()
      )
      .subscribe({
        next: (files) => {
          this.filesSubject.next(files);
          this.loadingSubject.next(false);
          this.errorSubject.next(null);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Polling error:', error);
          this.loadingSubject.next(false);
          this.errorSubject.next(this.getErrorMessage(error));
          this.stopPolling();
        },
      });
  }

  stopPolling(): void {
    this.polling$.next();
    this.isPolling = false;
    this.loadingSubject.next(false);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchFileStatus(): Observable<FileStatus[]> {
    return this.http.get<FileStatus[]>(this.API_URL).pipe(
      tap({
        error: (error: HttpErrorResponse) => {
          console.error('File status fetch error:', error);
          this.errorSubject.next(this.getErrorMessage(error));
        },
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Network error: ${error.error.message}`;
    }

    // Handle specific HTTP status codes
    switch (error.status) {
      case 404:
        return 'Files endpoint not found. Please check the API server is running.';
      case 500:
        return 'Server error while fetching file status.';
      case 0:
        return 'Cannot connect to file status server. Please check your connection.';
      default:
        return `Error fetching file status: ${error.status} ${error.statusText}`;
    }
  }

  // Manual refresh method
  refresh(): void {
    this.fetchFileStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (files) => {
          this.filesSubject.next(files);
          this.errorSubject.next(null);
        },
        error: (error: HttpErrorResponse) => {
          this.errorSubject.next(this.getErrorMessage(error));
        },
      });
  }
}
