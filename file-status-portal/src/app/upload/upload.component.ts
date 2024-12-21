import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
selector: 'app-upload',
templateUrl: './upload.component.html',
styleUrls: ['./upload.component.css'],
imports: [CommonModule, MatProgressBarModule],
standalone: true,
})
export class UploadComponent {
  selectedFiles: any[] = [];
  apiUrl = 'http://127.0.0.1:8000/upload/';

  constructor(private http: HttpClient) {}

  onFileSelect(event: any) {
    this.selectedFiles = Array.from(event.target.files).map((file: any) => ({
      file,
      name: file.name,
      status: 'pending',
    }));
  }

  uploadFiles() {
    this.selectedFiles.forEach((fileObj) => {
      fileObj.status = 'uploading';
      const formData = new FormData();
      formData.append('file', fileObj.file);

      this.http.post(this.apiUrl, formData).subscribe({
        next: (response) => {
          fileObj.status = 'uploaded';
        },
        error: () => {
          fileObj.status = 'error';
        },
      });
    });
  }
}
