import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  me: any;

  async updateMe() {
    this.me = await this.get('my-user');
  }

  get(endpoint: string) {
    return firstValueFrom(this.http.get<any>(`${environment.apiHost}/${endpoint}`))
  }

  post(endpoint: string, body: any) {
    return firstValueFrom(this.http.post<any>(`${environment.apiHost}/${endpoint}`, body))
  }

  delete(endpoint: string) {
    return firstValueFrom(this.http.delete<any>(`${environment.apiHost}/${endpoint}`))
  }
}
