import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { GoogleDriveLoginDialogComponent } from '../dialogs/google-drive-login-dialog/google-drive-login-dialog.component';

export interface GoogleDriveTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

const STORAGE_KEY = 'bispado_google_drive_tokens';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveAuthService {

  constructor(
    private http: HttpService,
    private dialog: MatDialog
  ) { }

  getStoredTokens(): GoogleDriveTokens | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveTokens(tokens: GoogleDriveTokens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  clearTokens() {
    localStorage.removeItem(STORAGE_KEY);
  }

  async loginWithPopup(): Promise<GoogleDriveTokens> {
    const { url } = await this.http.get('google/auth-url');

    return new Promise((resolve, reject) => {
      const popup = window.open(url, 'google-oauth', 'width=520,height=640');
      if (!popup) {
        reject(new Error('Não foi possível abrir a janela de login do Google. Verifique se pop-ups estão bloqueados.'));
        return;
      }

      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Tempo esgotado aguardando login do Google Drive.'));
      }, 120000);

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== environment.apiHost) return;
        if (event.data?.type !== 'google-oauth-success') return;
        cleanup();
        const tokens: GoogleDriveTokens = event.data.tokens;
        this.saveTokens(tokens);
        resolve(tokens);
      };

      const timer = window.setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error('Login do Google Drive cancelado.'));
        }
      }, 500);

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        window.clearTimeout(timeout);
        window.clearInterval(timer);
        if (!popup.closed) popup.close();
      };

      window.addEventListener('message', onMessage);
    });
  }

  async ensureAuthenticated(forceLogin = false): Promise<GoogleDriveTokens> {
    if (!forceLogin) {
      const stored = this.getStoredTokens();
      if (stored?.access_token) return stored;
    }

    const ref = this.dialog.open(GoogleDriveLoginDialogComponent, {
      disableClose: true,
      width: '420px'
    });

    return firstValueFrom(ref.afterClosed()).then((tokens) => {
      if (!tokens?.access_token) {
        throw Object.assign(new Error('Login do Google Drive é necessário para atualizar a ata.'), { googleAuthRequired: true });
      }
      return tokens;
    });
  }
}
