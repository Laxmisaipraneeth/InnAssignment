import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { SERVICES, LANGUAGES } from '../constants/data.constants';
import { HelperStoreService } from '../helper-store.service';
import { Helper } from '../models/helper.model';
import { HelperDetailsComponent } from '../helper-details/helper-details.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

type FieldType = 'select' | 'input' | 'radio' | 'conditional-input';

interface FormFieldConfig {
  name: string;
  type: FieldType;
  label: string;
  formControl: AbstractControl;
  placeholder?: string;
  options?: string[];
  isMultiSelect?: boolean;
  hasSearch?: boolean;
  inputType?: 'text' | 'tel' | 'email';
  errors?: { type: string; message: string }[];
  searchLabel?: string;
  condition?: (form: FormGroup) => boolean;
}

@Component({
  selector: 'app-helper',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
    MatStepperModule,
    HelperDetailsComponent
  ],
  standalone: true,
  templateUrl: './helper.component.html',
  styleUrl: './helper.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class HelperComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private helperStore: HelperStoreService,
    private toastr: ToastrService
  ) { }

  services: string[] = SERVICES;
  languagesList: string[] = LANGUAGES;
  vehicles: string[] = ['None', 'Auto', 'Bike', 'Car', 'Cycle'];

  photoFileName: string = '';
  selectedKycFile: File | null = null;
  imgSrc: string | null = null;
  serviceSearch: string = '';

  previewHelper: Helper | null = null;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('kycInput') kycInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('stepper') stepper!: MatStepper;

  languageCountValidator: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    if (!Array.isArray(value)) return null;
    return (value.length >= 1 && value.length <= 3) ? null : { invalidLanguageCount: true };
  }

  profileForm = new FormGroup({
    profilePic: new FormControl<File | null>(null),
    serviceType: new FormControl('', Validators.required),
    orgName: new FormControl('', Validators.required),
    fullName: new FormControl('', Validators.required),
    languages: new FormControl<string[]>([], [Validators.required, this.languageCountValidator]),
    gender: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.pattern('[0-9]{10}'), Validators.required]),
    email: new FormControl('', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\\.[a-zA-Z]{2,}$')]),
    vehicleType: new FormControl('None', Validators.required),
    vehicleNumber: new FormControl(''),
    kycDoc: new FormControl<File | null>(null, Validators.required),
  });

  additionalFormGroup = new FormGroup({
    otherDocs: new FormControl<File | null>(null)
  });

  formFieldsConfig = signal<FormFieldConfig[]>([
    { name: 'serviceType', type: 'select', label: 'Type of Service*', formControl: this.profileForm.get('serviceType')!, placeholder: 'Search service', options: this.services, hasSearch: true, errors: [{ type: 'required', message: 'This field is mandatory.' }], searchLabel: 'Search for services' },
    { name: 'orgName', type: 'select', label: 'Organization Name*', formControl: this.profileForm.get('orgName')!, placeholder: 'Organization Name', options: ['ASBL', 'Springers Helpers'], errors: [{ type: 'required', message: 'This field is mandatory.' }] },
    { name: 'fullName', type: 'input', label: 'Full Name*', formControl: this.profileForm.get('fullName')!, inputType: 'text', placeholder: 'Full Name', errors: [{ type: 'required', message: 'This field is mandatory.' }] },
    { name: 'languages', type: 'select', label: 'Languages*', formControl: this.profileForm.get('languages')!, placeholder: 'Languages', options: this.languagesList, isMultiSelect: true, errors: [{ type: 'invalidLanguageCount', message: 'Select at least 1 and at most 3 languages.' }] },
    { name: 'gender', type: 'radio', label: 'Gender*', formControl: this.profileForm.get('gender')!, options: ['Male', 'Female', 'Other'], errors: [{ type: 'required', message: 'Please select a gender.' }] },
    { name: 'phone', type: 'input', label: 'Phone*', formControl: this.profileForm.get('phone')!, inputType: 'tel', placeholder: '', errors: [{ type: 'required', message: 'This field is mandatory.' }, { type: 'pattern', message: 'Please enter a valid 10-digit number.' }] },
    { name: 'email', type: 'input', label: 'Email', formControl: this.profileForm.get('email')!, inputType: 'email', placeholder: 'example@abc.com', errors: [{ type: 'pattern', message: 'Please enter a valid email.' }] },
    { name: 'vehicleType', type: 'select', label: 'Choose Vehicle Type', formControl: this.profileForm.get('vehicleType')!, placeholder: 'None', options: this.vehicles },
    { name: 'vehicleNumber', type: 'conditional-input', label: 'Vehicle Number*', formControl: this.profileForm.get('vehicleNumber')!, inputType: 'text', placeholder: 'TG01AB1234', condition: (form) => form.get('vehicleType')?.value !== 'None' },
  ]);

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.imgSrc) {
      URL.revokeObjectURL(this.imgSrc);
    }
  }

  goToDashboard() {
    this.router.navigate(['dashboard']);
  }

  submitForm() {
    if (this.profileForm.valid) {
      const formData = new FormData();

      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (key !== 'profilePic' && key !== 'kycDoc') {
          if (key === 'languages' && control?.value) {
            formData.append(key, JSON.stringify(control.value));
          } else if (control?.value) {
            formData.append(key, control.value);
          }
        }
      });

      const profilePicFile = this.profileForm.get('profilePic')?.value;
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const kycDocFile = this.profileForm.get('kycDoc')?.value;
      if (kycDocFile) {
        formData.append('kycDoc', kycDocFile);
        formData.append('kycDocName', kycDocFile.name);
      }

      this.helperStore.addHelper(formData).subscribe({
        next: () => {
          this.toastr.success('Helper registered successfully!', 'Success');
          this.goToDashboard();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.toastr.warning(err.error.error, 'Duplicate Found', {
              timeOut: 5000,
              closeButton: true,
              progressBar: true,
            });
            this.stepper.selectedIndex = 0;
          } else {
            this.toastr.error('An unexpected error occurred. Please try again.', 'Submission Failed');
            console.error('Error submitting profile:', err);
          }
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  goToNextStep(stepper: MatStepper, stage: string) {
    if (stage === 'first') {
      if (this.profileForm.valid) {
        this.previewHelper = {
          _id: '',
          eCode: -1,
          profilePic: this.imgSrc,
          fullName: this.profileForm.value.fullName || '',
          gender: this.profileForm.value.gender as any || 'other',
          phone: this.profileForm.value.phone || '',
          email: this.profileForm.value.email || '',
          languages: this.profileForm.value.languages || [],
          serviceType: this.profileForm.value.serviceType || '',
          orgName: this.profileForm.value.orgName as any || 'ASBL',
          vehicleType: this.profileForm.value.vehicleType as any || 'None',
          vehicleNumber: this.profileForm.value.vehicleNumber || '',
          kycDocName: this.selectedKycFile?.name || '',
          joinedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPreview: true,
        };
        stepper.next();
      } else {
        this.profileForm.markAllAsTouched();
      }
    } else {
      stepper.next();
    }
  }

  filteredServices(): string[] {
    if (!this.serviceSearch) return this.services;
    return this.services.filter(service =>
      service.toLowerCase().includes(this.serviceSearch.toLowerCase())
    );
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size exceeds 5 MB limit.', 'Upload Error');
        return;
      }
      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error('Invalid file type. Only PNG/JPEG allowed.', 'Upload Error');
        return;
      }
      if (this.imgSrc) {
        URL.revokeObjectURL(this.imgSrc);
      }
      this.imgSrc = URL.createObjectURL(file);
      this.profileForm.patchValue({ profilePic: file });
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
    if (file) {
      this.selectedKycFile = file;
      this.profileForm.patchValue({ kycDoc: file });
      this.profileForm.get('kycDoc')?.markAsTouched();
    }
  }

  previewKycFile(event: Event): void {
    event.preventDefault();
    const kycFile = this.profileForm.get('kycDoc')?.value;
    if (kycFile) {
      const fileURL = URL.createObjectURL(kycFile);
      window.open(fileURL, '_blank');
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

  validateNumber(event: KeyboardEvent): void {
    const phoneControl = this.profileForm.get('phone');
    if (phoneControl?.value && phoneControl.value.length >= 10) {
      event.preventDefault();
      return;
    }
    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit) {
      event.preventDefault();
    }
  }
}