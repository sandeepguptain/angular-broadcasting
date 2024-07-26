export interface Message {
  text: string;
  time: Date;
  source: 'page-one' | 'page-two';
}
