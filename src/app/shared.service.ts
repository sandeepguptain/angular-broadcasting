import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from './message.interface';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private typingSubjects: { [key: string]: Subject<boolean> } = {
    'page-one': new Subject<boolean>(),
    'page-two': new Subject<boolean>(),
  };

  messages$ = this.messagesSubject.asObservable();

  private bc = new BroadcastChannel('shared-service');

  constructor(private ngZone: NgZone) {
    this.bc.onmessage = (event) => {
      this.ngZone.run(() => {
        const { type, payload } = event.data;
        switch (type) {
          case 'addMessage':
            this.addMessageLocally(payload);
            break;
          case 'setTyping':
            this.setTypingLocally(payload.source, payload.isTyping);
            break;
          default:
            console.log('Unknown message type:', type);
            break;
        }
      });
    };
  }

  addMessage(message: Message) {
    this.addMessageLocally(message);
    this.bc.postMessage({ type: 'addMessage', payload: message });
  }

  private addMessageLocally(message: Message) {
    const messages = this.messagesSubject.getValue();
    messages.push(message);
    this.messagesSubject.next(messages);
  }

  setTyping(source: string, isTyping: boolean) {
    this.setTypingLocally(source, isTyping);
    this.bc.postMessage({ type: 'setTyping', payload: { source, isTyping } });
  }

  private setTypingLocally(source: string, isTyping: boolean) {
    this.typingSubjects[source].next(isTyping);
  }

  isTyping$(source: string) {
    return this.typingSubjects[source].asObservable();
  }
}
