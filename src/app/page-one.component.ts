import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Message } from './message.interface';
import { SharedService } from './shared.service';
import { debounceTime, Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-page-one',
  template: `
    <mat-card class="chat-container">
      <mat-card-header>
        <mat-card-title>Chat (Page One)</mat-card-title>
      </mat-card-header>
      <mat-card-content class="chat-messages">
        @for (message of messages; track message.time) {
        <div
          class="message"
          [ngClass]="{
            'user-message': message.source === 'page-one',
            'other-message': message.source === 'page-two'
          }"
        >
          <div class="message-content">{{ message.text }}</div>
          <div class="message-timestamp">
            {{ message.time | date : 'short' }}
          </div>
        </div>
        } @if (isOtherTyping) {
        <div class="typing-indicator">Page Two is typing...</div>
        }
      </mat-card-content>
      <mat-card-actions class="chat-input">
        <mat-form-field appearance="outline" class="full-width">
          <input
            matInput
            [(ngModel)]="newMessage"
            placeholder="Type a message..."
            (keyup.enter)="sendMessage()"
            (ngModelChange)="onTyping()"
          />
        </mat-form-field>
        <button
          mat-fab
          color="primary"
          (click)="sendMessage()"
          [disabled]="!newMessage.trim()"
        >
          <mat-icon>send</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class PageOneComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  isOtherTyping = false;
  private subscription$!: Subscription;
  private typingSubscription$!: Subscription;
  private typingSubject$ = new Subject<void>();

  constructor(private sharedService: SharedService, private ngZone: NgZone) {}

  ngOnInit() {
    this.subscription$ = this.sharedService.messages$.subscribe((messages) => {
      this.ngZone.run(() => {
        this.messages = messages;
      });
    });

    this.typingSubscription$ = this.sharedService
      .isTyping$('page-two')
      .subscribe((isTyping) => {
        this.ngZone.run(() => {
          this.isOtherTyping = isTyping;
        });
      });

    this.typingSubject$.pipe(debounceTime(300)).subscribe(() => {
      this.sharedService.setTyping(
        'page-one',
        this.newMessage.trim().length > 0
      );
    });
  }

  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
    if (this.typingSubscription$) {
      this.typingSubscription$.unsubscribe();
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.sharedService.addMessage({
        source: 'page-one',
        text: this.newMessage,
        time: new Date(),
      });
      this.newMessage = '';
      this.sharedService.setTyping('page-one', false);
    }
  }

  onTyping() {
    this.typingSubject$.next();
  }
}
