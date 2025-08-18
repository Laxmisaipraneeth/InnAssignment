import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() { }

  public captureAndDownload(element: HTMLElement, fileName:string):void{
    if(!element){
      console.log('no element with the given name');
    }
    html2canvas(element).then((canvas)=>{
      const imgData= canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a');
      downloadLink.href = imgData;
      downloadLink.download =fileName;
      downloadLink.click();
    })
  }
}
