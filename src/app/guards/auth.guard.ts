
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from '../services/http.service';

@Injectable({
  providedIn: 'root'
})


export class AuthGuard implements CanActivate {
  constructor(
    private http: HttpService,
    private router: Router
  ) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      await this.http.updateMe()
      return true;
    }
    catch (reason) {
      //localStorage.removeItem('api_token')
      console.log(route)
      this.router.navigate(["login"], { queryParams: { redirect: route.routeConfig?.path } })
      return false
    }


  }

}
