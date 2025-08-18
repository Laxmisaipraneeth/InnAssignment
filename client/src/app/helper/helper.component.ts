import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectTrigger } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { SERVICES, LANGUAGES, COUNTRY_CODES, VEHICLES } from '../constants/data.constants';

import { HelperStoreService } from '../helper-store.service';

@Component({
  selector: 'app-helper',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatRadioModule, FormsModule, MatSelectTrigger, MatStepperModule],
  standalone: true,
  templateUrl: './helper.component.html',
  styleUrl: './helper.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class HelperComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private helperStore: HelperStoreService) { }

  services: string[] = SERVICES;
  languagesList: string[] = LANGUAGES;
  countryCodes: string[] = COUNTRY_CODES;
  vehicles: string[] = VEHICLES;

  photoFileName: string = '';
  kycFileName = '';
  selectedKycFile: File | null = null;
  imgSrc: string | null = null;
  serviceSearch: string = '';

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('kycInput') kycInputRef!: ElementRef<HTMLInputElement>;

  languageCountValidator: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    if (!Array.isArray(value)) return null;

    const length = value.length;
    if (length < 1 || length > 3) {
      return { invalidLanguageCount: true };
    }
    return null;
  }

  profileForm = new FormGroup({
    profilePic: new FormControl<File | null>(null),
    serviceType: new FormControl('', Validators.required),
    orgName: new FormControl('', Validators.required),
    fullName: new FormControl('', Validators.required),
    languages: new FormControl([], [Validators.required, this.languageCountValidator]),
    gender: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.pattern('[0-9]{10}'), Validators.required]),
    email: new FormControl('', [Validators.pattern('^[a-zA-z0-9._%+-]+@[a-zA-z0-9._%+-]+\\.[a-zA-Z]{2,}$')]),
    vehicleType: new FormControl('None', Validators.required),
    vehicleNumber: new FormControl(''),
    kycDoc: new FormControl<File | null>(null, Validators.required),
  });

  additionalFormGroup = new FormGroup({
    otherDocs: new FormControl<File | null>(null)
  });

  validateNumber(event: KeyboardEvent): void {
    if (this.profileForm.get('phone')?.value?.length == 10) return;
    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit) {
      event.preventDefault()
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.imgSrc) {
      URL.revokeObjectURL(this.imgSrc);
    }
  }

  goToDashboard() {
    this.router.navigate(['dashboard'])
  }

  submitForm() {
    if (this.profileForm.valid && this.additionalFormGroup.valid) {
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

      const profilePic = this.profileForm.get('profilePic')?.value;
      if (profilePic) formData.append('profilePic', profilePic);

      const kycDoc = this.profileForm.get('kycDoc')?.value;
      if (kycDoc) {
        formData.append('kycDoc', kycDoc);
        formData.append('kycDocName', kycDoc.name);
      }

      const otherDocs = this.additionalFormGroup.get('otherDocs')?.value;
      if (otherDocs) formData.append('otherDocs', otherDocs);


      this.helperStore.addHelper(formData).subscribe({
        next: (data) => {
          console.log(data);
          this.goToDashboard();
        },
        error: (err) => {
          console.error('Error submitting profile:', err);
        }
      });

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

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5 MB limit');
        return;
      }
      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Only PNG/JPEG allowed.');
        return;
      }
      this.imgSrc = URL.createObjectURL(file);
      this.profileForm.patchValue({ profilePic: file });
      this.profileForm.get('profilePic')?.updateValueAndValidity();
      this.photoFileName = file.name;
    }
  }

  handlePhotoUploadClick(event: Event) {
    this.photoInput.nativeElement.click();
  }

  handleKycUploadClick(event: Event) {
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
    this.selectedKycFile = file;
    this.profileForm.get('kycDoc')?.setValue(file);
    this.profileForm.get('kycDoc')?.markAsTouched();
    this.kycInputRef.nativeElement.value = '';
  }

  previewKycFile(event: Event): void {
    event.preventDefault();
    const kycFile = this.profileForm.get('kycDoc')?.value;
    if (kycFile) {
      const fileURL = URL.createObjectURL(kycFile);
      window.open(fileURL, '_blank');
    }
  }

  goToNextStep(stepper: MatStepper, stage: string) {
    if (stage == 'first') {
      if (this.profileForm.valid) {
        stepper.next();
      } else {
        this.profileForm.markAllAsTouched();
      }
    } else {
      stepper.next();
    }
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
