import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Helper } from '../models/helper.model';
import { HelperStoreService } from '../helper-store.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { IdCardComponent } from '../id-card/id-card.component';

@Component({
  selector: 'app-helper-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './helper-details.component.html',
  styleUrl: './helper-details.component.scss'
})
export class HelperDetailsComponent {

  @Input() selectedHelper!: Helper;
  @Input() kycDoc: File | null = null;

  @Output() onEdit = new EventEmitter<Helper>();
  @Output() onDelete = new EventEmitter<void>();

  constructor(private helperStore: HelperStoreService, private dialog: MatDialog) { }

  editHelper(helper: Helper): void {
    this.onEdit.emit(helper);
  }

  deleteHelper(): void {
    this.onDelete.emit();
  }

  viewID(): void {
    this.dialog.open(IdCardComponent, {
      data: this.selectedHelper
    });
  }

  viewKyc(helperId: string | undefined): void {
    if (this.kycDoc) {
      const fileURL = URL.createObjectURL(this.kycDoc);
      window.open(fileURL, '_blank');
      return;
    }
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
}