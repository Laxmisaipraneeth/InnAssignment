import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectTrigger } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperStoreService } from '../helper-store.service';
import { Helper } from '../models/helper.model';
import { Subscription } from 'rxjs';
import { SERVICES, LANGUAGES, COUNTRY_CODES, VEHICLES } from '../constants/data.constants';


@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
    MatSelectTrigger,
    MatStepperModule
  ],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  helperId!: string | null;
  currentHelper!: Helper | undefined;

  services: string[] = SERVICES;
  languagesList: string[] = LANGUAGES;
  countryCodes: string[] = COUNTRY_CODES;
  vehicles: string[] = VEHICLES;

  imgSrc: string | null = null;
  photoFileName = '';
  kycFileName = '';

  languageCountValidator: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    if (!Array.isArray(value)) return null;
    const length = value.length;
    if (length < 1 || length > 3) return { invalidLanguageCount: true };
    return null;
  };

  profileForm = new FormGroup({
    profilePic: new FormControl<File | null>(null),
    serviceType: new FormControl('', Validators.required),
    orgName: new FormControl('', Validators.required),
    fullName: new FormControl('', Validators.required),
    languages: new FormControl<string[]>([], [Validators.required, this.languageCountValidator]),
    gender: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.pattern('[0-9]{10}'), Validators.required]),
    email: new FormControl('', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    vehicleType: new FormControl('None', Validators.required),
    vehicleNumber: new FormControl(''),
    kycDoc: new FormControl<File | null>(null),
  });

  serviceSearch = '';

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('kycInput') kycInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private helperStore: HelperStoreService
  ) { }

  ngOnInit(): void {
    this.helperId = this.route.snapshot.paramMap.get('id');

    if (!this.helperId) {
      console.warn('No helper id in route');
      this.router.navigate(['/dashboard']);
      return;
    }

    const s = this.helperStore.getHelperById(this.helperId).subscribe(helper => {
      this.currentHelper = helper;
      if (helper) this.patchFormWithHelper(helper);
    });
    this.subs.add(s);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.imgSrc) {
      URL.revokeObjectURL(this.imgSrc);
    }
  }

  filteredServices(): string[] {
    if (!this.serviceSearch) return this.services;
    return this.services.filter(service =>
      service.toLowerCase().includes(this.serviceSearch.toLowerCase())
    );
  }

  get selectedLanguages(): string[] {
    return this.profileForm.get('languages')?.value || [];
  }

  private patchFormWithHelper(h: Helper) {
    this.profileForm.patchValue({
      serviceType: h.serviceType ?? '',
      orgName: h.orgName ?? '',
      fullName: h.fullName ?? '',
      languages: h.languages ?? [],
      gender: h.gender ?? '',
      phone: h.phone ?? '',
      email: h.email ?? '',
      vehicleType: h.vehicleType ?? 'None',
      vehicleNumber: h.vehicleNumber ?? ''
    });

    const profilePicUrl = (h as any).profilePic;

    if (typeof profilePicUrl === 'string' && profilePicUrl.startsWith('data:image')) {
      this.imgSrc = profilePicUrl;
      this.photoFileName = 'Existing image';
      this.profileForm.get('profilePic')?.setValue(null);
    } else {
      this.imgSrc = null;
      this.photoFileName = '';
    }

    if ((h as any).kycDocName) {
      this.kycFileName = (h as any).kycDocName;
      this.profileForm.get('kycDoc')?.setValue(null);
    } else {
      this.kycFileName = '';
    }
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit');
      return;
    }
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Only PNG/JPEG allowed.');
      return;
    }

    this.profileForm.patchValue({ profilePic: file });
    this.profileForm.get('profilePic')?.updateValueAndValidity();

    if (this.imgSrc) {
      URL.revokeObjectURL(this.imgSrc);
    }
    this.imgSrc = URL.createObjectURL(file);
    this.photoFileName = file.name;
  }

  handlePhotoUploadClick(event: Event) {
    event?.stopPropagation();
    this.photoInput.nativeElement.click();
  }

  handleKycUploadClick(event: Event) {
    event?.stopPropagation();
    this.kycInputRef.nativeElement.click();
  }

  onKycFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert(`${file.name} is not a valid file type`);
      return;
    }

    this.kycFileName = file.name;
    this.profileForm.get('kycDoc')?.setValue(file);
    this.profileForm.get('kycDoc')?.markAsTouched();

    this.kycInputRef.nativeElement.value = '';
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  onViewKyc() {
    const kycFile = this.profileForm.get('kycDoc')?.value as File | null;
    if (kycFile) {
      const url = URL.createObjectURL(kycFile);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } else if (this.currentHelper?._id) {
       this.helperStore.getKycDocument(this.currentHelper._id).subscribe({
        next: (blob) => {
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL, '_blank');
        },
        error: (err) => alert("Could not retrieve existing KYC document.")
      });
    } else {
      alert('No KYC available to view.');
    }
  }

  private updateHelper() {
    if (!this.helperId) {
      alert('Missing helper id');
      return;
    }

    const profilePicFile = this.profileForm.get('profilePic')?.value as File | null;
    const kycFile = this.profileForm.get('kycDoc')?.value as File | null;

    if (profilePicFile || kycFile) {
      const formData = new FormData();
      formData.append('fullName', this.profileForm.get('fullName')?.value || '');
      formData.append('gender', this.profileForm.get('gender')?.value || '');
      formData.append('phone', this.profileForm.get('phone')?.value || '');
      formData.append('languages', JSON.stringify(this.profileForm.get('languages')?.value || []));
      formData.append('email', this.profileForm.get('email')?.value || '');
      formData.append('serviceType', this.profileForm.get('serviceType')?.value || '');
      formData.append('orgName', this.profileForm.get('orgName')?.value || '');
      formData.append('vehicleType', this.profileForm.get('vehicleType')?.value || '');
      formData.append('vehicleNumber', this.profileForm.get('vehicleNumber')?.value || '');

      if (profilePicFile) formData.append('profilePic', profilePicFile);
      if (kycFile) {
        formData.append('kycDoc', kycFile);
        formData.append('kycDocName', kycFile.name);
      }

      return this.helperStore.editHelperWithFiles(this.helperId, formData);
    } else {
      const changes: Partial<Helper> = {
        fullName: this.profileForm.get('fullName')?.value ?? undefined,
        gender: this.profileForm.get('gender')?.value as "other" | "male" | "female" | "Male" | "Female" | "Other" | undefined,
        phone: this.profileForm.get('phone')?.value ?? undefined,
        languages: this.profileForm.get('languages')?.value ?? undefined,
        email: this.profileForm.get('email')?.value ?? undefined,
        serviceType: this.profileForm.get('serviceType')?.value ?? undefined,
        orgName: this.profileForm.get('orgName')?.value as "ASBL" | "Springers Helpers" | undefined,
        vehicleType: this.profileForm.get('vehicleType')?.value as "None" | "Auto" | "Bike" | "Car" | "Cycle" | undefined,
        vehicleNumber: this.profileForm.get('vehicleNumber')?.value ?? undefined
      };
      return this.helperStore.editHelper(this.helperId, changes);
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToNextStep() {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.updateHelper()?.subscribe({
      next: (updatedHelper: Helper) => {
        this.currentHelper = updatedHelper;
        this.patchFormWithHelper(updatedHelper);
        alert('Helper updated successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update helper. Please try again.');
      }
    });
  }
}