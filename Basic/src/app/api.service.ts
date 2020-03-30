import {Injectable, Type} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, retry, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private SERVER_URL = 'http://localhost:3000/products';
  public first = '';
  public prev = '';
  public next = '';
  public last = '';
  constructor(private httpClient: HttpClient) { }
  parseLinkHeader(header) {
    if (header.length === 0) {
      return;
    }
    const parts = header.split(',');
    console.log(parts[0]);
    const links = {
      first: '',
      last: '',
      next: '',
      prev: ''
    };
    parts.forEach(p => {
      const section = p.split(';');
      console.log(section[0]);
      const url = section[0].replace(/<(.*)>/, '$1').trim();
      const name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });
    this.first = links.first;
    this.last = links.last;
    this.prev = links.prev;
    this.next = links.next;
  }
  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
  public get() {
    // return this.httpClient.get(this.SERVER_URL).pipe(catchError(this.handleError));
    // tslint:disable-next-line:max-line-length
    return this.httpClient.get(this.SERVER_URL, {  params: new HttpParams({fromString: '_page=1&_limit=20'}), observe: 'response'}).pipe(retry(3), catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }
  public sendGetRequestToUrl(url: string){
    return this.httpClient.get(url, { observe: 'response'}).pipe(retry(3),
      catchError(this.handleError), tap(res => {
        console.log(res.headers.get('Link'));
        this.parseLinkHeader(res.headers.get('Link'));
      }));
  }
}
