import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GoogleDriveAuthService } from 'src/app/services/google-drive-auth.service';

@Component({
  selector: 'app-google-drive-login-dialog',
  templateUrl: './google-drive-login-dialog.component.html',
  styleUrls: ['./google-drive-login-dialog.component.css']
})
export class GoogleDriveLoginDialogComponent {

  isLoading = false;
  error = '';

  constructor(
    private googleAuth: GoogleDriveAuthService,
    private dialogRef: MatDialogRef<GoogleDriveLoginDialogComponent>
  ) { }

  async login() {
    this.isLoading = true;
    this.error = '';
    try {
      const tokens = await this.googleAuth.loginWithPopup();
      this.dialogRef.close(tokens);
    } catch (ex: any) {
      this.error = ex?.message || 'Falha ao autenticar no Google Drive.';
    } finally {
      this.isLoading = false;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
