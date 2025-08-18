import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Helper, IPaginatedHelpersResponse } from './models/helper.model';
import { map, Observable } from 'rxjs';
import AddHelperResponse from './models/addhelper.response';
import { IHelperFetchParams } from './helper-store.service';


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseServerUrl: string;
  constructor(private http: HttpClient) {
    this.baseServerUrl = 'http://localhost:3000';
  }

  getRandomPic(name: string) {
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  submitProfile(data: FormData): Observable<AddHelperResponse> {
    const url = `${this.baseServerUrl}/api/upload`;
    return this.http.post(url, data) as Observable<AddHelperResponse>;
  }

  deleteHelper(uid: string) {
    const url = `${this.baseServerUrl}/api/deleteHelper/${uid}`;
    return this.http.delete(url);
  }


  updateHelper(id: string, data: Partial<Helper>): Observable<Helper> {
    const url = `${this.baseServerUrl}/api/updateHelper/${id}`;
    return this.http.put<any>(url, data).pipe(
      map(response => response.helper)
    );
  }

  updateHelperWithFiles(id: string, formData: FormData): Observable<Helper> {
    const url = `${this.baseServerUrl}/api/updateHelper/${id}`;
    return this.http.put<any>(url, formData).pipe(
      map(response => response.helper)
    );
  }



  getKycDocument(helperId: string): Observable<Blob> {
    const url = `${this.baseServerUrl}/api/helpers/${helperId}/kyc`;
    return this.http.get(url, { responseType: 'blob' });
  }


  getHelpersPaginated(params:IHelperFetchParams): Observable<IPaginatedHelpersResponse> {
    const url = `${this.baseServerUrl}/api/helpers`;
    

    let httpParams = new HttpParams();

    httpParams = httpParams.set('page',params.page.toString());
    httpParams = httpParams.set('limit',params.limit.toString());


    if(params.search){
      httpParams = httpParams.set('search',params.search);
    }


    if(params.sortBy){
      httpParams = httpParams.set('sortBy',params.sortBy);
    }
    if(params.servicesFilter){
      httpParams = httpParams.set('services',params.servicesFilter);
    }
    if(params.orgFilter){
      httpParams = httpParams.set('organizations',params.orgFilter);
    }


    return this.http.get<IPaginatedHelpersResponse>(url,{params:httpParams})
  }
}
