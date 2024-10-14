import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkItemService {
  private dataUrl = 'assets/data/cosmicData.json';  // JSON file location

  constructor(private http: HttpClient) {}

  // Fetch all work item details
  getAllWorkItems(): Observable<any> {
    return this.http.get(this.dataUrl);
  }

  // Filter work item by cosmicId
  getDetailsByCosmicId(cosmicId: string, workItems: any[]): any {
    return workItems.find((item) => item.cosmicId === cosmicId);
  }
}
