import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { ClientService } from './client.service';
import { Helper, IPaginatedHelpersResponse } from './models/helper.model';
import { tap, catchError, map, debounceTime, switchMap, filter, distinctUntilChanged } from 'rxjs/operators';
import AddHelperResponse from './models/addhelper.response';

export interface IHelperFetchParams extends IFilter {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
}
export interface IFilter {
  servicesFilter?: string;
  orgFilter?: string;
}


@Injectable({
  providedIn: 'root'
})
export class HelperStoreService {
  private helpersSubject = new BehaviorSubject<Helper[]>([]);
  public helpers$ = this.helpersSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private totalHelpersSubject = new BehaviorSubject<number>(0);
  public totalHelpers$ = this.totalHelpersSubject.asObservable();

  private loadTriggerSubject = new Subject<IHelperFetchParams>();

  private currentPage = 0;
  private totalPages = 0;
  private currentSearchTerm = "";
  private currentSortKey = 'fullName';
  private orgFilter = "";
  private serviceFilter = "";

  constructor(private clientService: ClientService) {
    this.setupLoadTrigger();
    this.loadInitialPage();
  }

  public search(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    this.resetAndFetch();
  }


  public sort(key: 'name' | 'eCode'): void {

    if (key == 'name') {
      this.currentSortKey = 'fullName';
    }
    else {
      this.currentSortKey = key;
    }

    console.log(this.currentSortKey)
    this.resetAndFetch();
  }

  public filter(filters: any): void {
    this.orgFilter = filters.orgs as string;
    this.serviceFilter = filters.services as string;
    this.resetAndFetch();
    console.log('in helper-store.service');

    console.log(this.orgFilter, this.serviceFilter)
  }

  public loadInitialPage(limit: number = 20): void {
    this.currentPage = 0;
    this.totalPages = 0;
    this.helpersSubject.next([]);
    this.loadTriggerSubject.next({ page: 1, limit });
  }

  public loadMore(limit: number = 20): void {
    const nextPage = this.currentPage + 1;
    this.loadTriggerSubject.next(
      {
        page: nextPage,
        limit: 20,
        search: this.currentSearchTerm,
        sortBy: this.currentSortKey,
        servicesFilter: this.serviceFilter,
        orgFilter: this.orgFilter
      }
    );
  }

  public hasMorePages(): boolean {
    return this.totalPages === 0 || this.currentPage < this.totalPages;
  }

  private resetAndFetch(): void {
    this.currentPage = 0;
    this.totalPages = 0;
    this.helpersSubject.next([]);
    this.loadTriggerSubject.next({
      page: 1,
      limit: 20,
      search: this.currentSearchTerm,
      sortBy: this.currentSortKey,
      servicesFilter: this.serviceFilter,
      orgFilter: this.orgFilter
    })
  }

  private setupLoadTrigger(): void {
    this.loadTriggerSubject.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      debounceTime(300),
      tap(() => this.isLoadingSubject.next(true)),
      switchMap(
        params => {
          console.log(params);

          return this.clientService.getHelpersPaginated(params).pipe(
            catchError(err => {
              console.error('Failed to fetch more helpers', err);
              this.isLoadingSubject.next(false);
              return of(null);

            })
          )
        }
      ),
      tap((res: IPaginatedHelpersResponse | null) => {
        if (res) {
          this.currentPage = res.page;
          this.totalPages = res.totalPages;

          this.totalHelpersSubject.next(res.total);

          if (res.page == 1) {
            this.helpersSubject.next(res.data);
          } else {
            const currentHelpers = this.helpersSubject.getValue();
            this.helpersSubject.next([...currentHelpers, ...res.data])
          }
        }
        this.isLoadingSubject.next(false);
      })
    ).subscribe({
      error: (err) => console.error("A critical error occurred in the load trigger subscription:", err)
    });
  }


  addHelper(formData: FormData): Observable<AddHelperResponse> {
    return this.clientService.submitProfile(formData).pipe(
      tap((newHelper) => {
        console.log('Raw api response:', newHelper.helper);
        const currentHelpers = this.helpersSubject.getValue();
        this.helpersSubject.next([...currentHelpers, newHelper.helper]);
      }),
      catchError(err => {
        console.error('Failed to add helper:', err);
        return throwError(() => err);
      })
    );
  }

  deleteHelper(id: string): void {
    this.clientService.deleteHelper(id).subscribe({
      next: () => {
        const updated = this.helpersSubject.getValue().filter(h => h._id !== id);
        this.helpersSubject.next(updated);
        this.totalHelpersSubject.next(this.totalHelpersSubject.getValue() - 1);
      },
      error: (err) => console.error(`Failed to delete helper ${id}:`, err)
    });
  }

  getHelperById(id: string): Observable<Helper | undefined> {
    return this.helpers$.pipe(map(list => list.find(h => h._id === id)));
  }

  editHelper(id: string, changes: Partial<Helper>): Observable<Helper> {
    const current = this.helpersSubject.getValue();
    const idx = current.findIndex(h => h._id === id);
    if (idx === -1) return throwError(() => new Error('Helper not found in store'));

    const old = { ...current[idx] };
    const optimistic = { ...old, ...changes };
    const optimList = [...current];
    optimList[idx] = optimistic;
    this.helpersSubject.next(optimList);

    return this.clientService.updateHelper(id, changes).pipe(
      tap((updated) => {
        const latest = this.helpersSubject.getValue().map(h => h._id === id ? updated : h);
        this.helpersSubject.next(latest);
      }),
      catchError(err => {
        const rolled = this.helpersSubject.getValue().map(h => h._id === id ? old : h);
        this.helpersSubject.next(rolled);
        return throwError(() => err);
      })
    );
  }

  editHelperWithFiles(id: string, formData: FormData): Observable<Helper> {
    const current = this.helpersSubject.getValue();
    const idx = current.findIndex(h => h._id === id);
    if (idx === -1) return throwError(() => new Error('Helper not found in store'));

    const old = { ...current[idx] };
    const optimistic = { ...old };
    if (formData.has('fullName')) optimistic.fullName = formData.get('fullName') as string;
    if (formData.has('phone')) optimistic.phone = formData.get('phone') as string;
    if (formData.has('email')) optimistic.email = formData.get('email') as string;
    if (formData.has('serviceType')) optimistic.serviceType = formData.get('serviceType') as string;

    const optimList = [...current];
    optimList[idx] = optimistic;
    this.helpersSubject.next(optimList);

    return this.clientService.updateHelperWithFiles(id, formData).pipe(
      tap((updated) => {
        const latest = this.helpersSubject.getValue().map(h => h._id === id ? updated : h);
        this.helpersSubject.next(latest);
      }),
      catchError(err => {
        const rolled = this.helpersSubject.getValue().map(h => h._id === id ? old : h);
        this.helpersSubject.next(rolled);
        return throwError(() => err);
      })
    );
  }

  getKycDocument(helperId: string): Observable<Blob> {
    return this.clientService.getKycDocument(helperId);
  }
}