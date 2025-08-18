import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import QRCode from 'qrcode';
import { DownloadService } from '../utils/download.service';

export interface IIdCardProps {
  fullName: string,
  eCode: number,
  profilePic?: string,
  serviceType: string,
  orgName: string,
  phone: string,
  joinedDate: string
}

@Component({
  selector: 'app-id-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './id-card.component.html',
  styleUrl: './id-card.component.scss'
})
export class IdCardComponent implements OnInit {
  dataUrl: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: IIdCardProps,
    public dialog: DialogRef<IdCardComponent>,
    public downloadService:DownloadService
  ) { }

  ngOnInit(): void {
    this.generateQRCode();
  }
  async generateQRCode(): Promise<void> {
    try {
      console.log(Object.values(this.data).slice(2).join("#"));

      this.dataUrl = await QRCode.toDataURL(Object.values(this.data).slice(1).join("#"));
    }
    catch (err) {
      console.log(err);

    }
  }
  closeDialog() {
    this.dialog.close();
  }
  onDownload() {
    console.log('clicked on download');

    const ele = document.getElementById('sel-for-canvas') as HTMLElement;
    this.downloadService.captureAndDownload(ele,`${this.data.eCode}-${this.data.fullName}-IDCARD`);
  }
  onPrint() {
    window.print();
  }
}
