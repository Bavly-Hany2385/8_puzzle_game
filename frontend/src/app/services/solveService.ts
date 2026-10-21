import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolveRequest } from '../models/tile';
import { SearchNode } from '../models/tile'



export interface SolveResponse {
  path: number[][] | null;
  cost: number | null;
  tree?: SearchNode[];
}

@Injectable({ providedIn: 'root' })
export class SolveService {
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  solve(request: SolveRequest): Observable<SolveResponse> {
    return this.http.post<SolveResponse>(`${this.apiUrl}/solve`, request);
  }
}