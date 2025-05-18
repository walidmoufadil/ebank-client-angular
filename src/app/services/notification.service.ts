import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notification = new BehaviorSubject<Notification | null>(null);

  showSuccess(message: string) {
    this.notification.next({ message, type: 'success' });
    this.autoHide();
  }

  showError(message: string) {
    this.notification.next({ message, type: 'error' });
    this.autoHide();
  }

  private autoHide() {
    setTimeout(() => {
      this.notification.next(null);
    }, 5000);
  }

  getNotification(): Observable<Notification | null> {
    return this.notification.asObservable();
  }

  clear() {
    this.notification.next(null);
  }
}
