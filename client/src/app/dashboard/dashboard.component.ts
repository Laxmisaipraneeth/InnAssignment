import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { Router } from '@angular/router';
import { HelperStoreService } from '../helper-store.service';
import { Helper } from '../models/helper.model';
import { FormsModule } from '@angular/forms';
import { SERVICES } from '../constants/data.constants';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription, fromEvent, Observable } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { IdCardComponent } from '../id-card/id-card.component';
import { DownloadService } from '../utils/download.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatInputModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  isFilterVisible = false;
  isDeleteModalVisible = false;
  isSortVisible = false;
  activeSortKey: 'name' | 'eCode' = 'name';
  totalHelpersCount: number = 0;

  filterServices: string[] = [];
  filterOrganizations: string[] = [];
  serviceSearch = '';
  searchTerm: string = "";

  servicesList: string[] = SERVICES;
  organizationsList: string[] = ['ASBL', 'Springers Helpers'];
  pickedDate!:Date;



  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  private scrollSubscription!: Subscription;
  private totalHelpersSubscription!: Subscription;
  helpers$: Observable<Helper[]>;
  isLoading$: Observable<boolean>;

  selectedHelper: Helper | null = null;


  constructor(
    private router: Router,
    public helperStore: HelperStoreService,
    public dialog: MatDialog,
    public downloadService: DownloadService
  ) {
    this.helpers$ = this.helperStore.helpers$;
    this.isLoading$ = this.helperStore.isLoading$;
  }

  ngOnInit(): void {

    this.totalHelpersSubscription = this.helperStore.totalHelpers$.subscribe(count => {
      this.totalHelpersCount = count;
    })

    this.helpers$.subscribe(helpers => {
      if (this.selectedHelper) {
        const updatedSelectedHelper = helpers.find(h => h._id === this.selectedHelper!._id);
        this.selectedHelper = updatedSelectedHelper || (helpers.length > 0 ? helpers[0] : null);
      } else if (helpers.length > 0) {
        this.selectedHelper = helpers[0];
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    if (this.totalHelpersSubscription) {
      this.totalHelpersSubscription.unsubscribe();
    }
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private setupInfiniteScroll(): void {
    if (!this.scrollContainer) return;

    this.scrollSubscription = fromEvent(this.scrollContainer.nativeElement, 'scroll').pipe(
      map(event => event.target as HTMLDivElement),
      filter(target => {
        return target.scrollTop + target.clientHeight >= target.scrollHeight - 100;
      }),
      tap(() => {
        this.helperStore.loadMore();
      })
    ).subscribe();
  }


  onSearchInput(event: any): void {
    this.searchTerm = event;
    this.helperStore.search(this.searchTerm);
  }

  doSomeSorting(key: 'name'|'eCode'): void {
    this.activeSortKey = key;
    console.log(key);

    this.helperStore.sort(this.activeSortKey);
    this.isSortVisible = false;
  }

  applyFilters(): void {
    console.log(this.filterServices.join(","));
    console.log(this.filterOrganizations.join(","));
    this.helperStore.filter({ services: this.filterServices, orgs: this.filterOrganizations });
    this.isFilterVisible = false;
  }

  selectHelper(helper: Helper): void {
    this.selectedHelper = helper;
  }

  toggleFilter(event: Event): void {
    event.stopPropagation();
    this.isFilterVisible = !this.isFilterVisible;
  }

  toggleSort(event: Event): void {
    event.stopPropagation();
    this.isSortVisible = !this.isSortVisible;
  }

  resetAllFilters(): void {
    if (this.filterOrganizations.length > 0 || this.filterServices.length > 0) {
      this.filterServices = [];
      this.filterOrganizations = [];
      this.applyFilters();
    }

  }

  resetServiceFilter(event: Event): void {
    event.stopPropagation();
    this.filterServices = [];
  }

  resetOrganizationFilter(event: Event): void {
    event.stopPropagation();
    this.filterOrganizations = [];
  }

  toggleSelectAll(filterType: 'service' | 'organization'): void {
    if (filterType === 'service') {
      this.filterServices = this.filterServices.length === this.servicesList.length ? [] : [...this.servicesList];
    } else {
      this.filterOrganizations = this.filterOrganizations.length === this.organizationsList.length ? [] : [...this.organizationsList];
    }
  }


  onDateChange(){
    console.log('picked dat', this.pickedDate);
    
  }


  editHelper(helper: Helper): void {
    this.router.navigate(['/edit-helper', helper._id]);
  }

  deleteHelper(): void {
    if (this.selectedHelper) {
      this.isDeleteModalVisible = true;
    }
  }

  confirmDelete(): void {
    if (this.selectedHelper?._id) {
      this.helperStore.deleteHelper(this.selectedHelper._id);
      this.selectedHelper = null;
    }
    this.isDeleteModalVisible = false;
  }

  cancelDelete(): void {
    this.isDeleteModalVisible = false;
  }

  navigateDashboard(): void {
    this.router.navigate(['/add-helper']);
  }



  viewKyc(helperId: string | undefined): void {
    if (!helperId) return;
    this.helperStore.getKycDocument(helperId).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err) => {
        console.error('Failed to download KYC doc:', err);
        alert('Could not retrieve the KYC document.');
      }
    });
  }
  viewID() {
    let dialogRef = this.dialog.open(IdCardComponent, {
      data: this.selectedHelper
    })
  }
  onDownload() {
    const elementRef = document.getElementById('download-button-tag') as HTMLElement;
    this.downloadService.captureAndDownload(elementRef, `${this.selectedHelper?.eCode}-
      ${this.selectedHelper?.fullName}-details`)
  }
}