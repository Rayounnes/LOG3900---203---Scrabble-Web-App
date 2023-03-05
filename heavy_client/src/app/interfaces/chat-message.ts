export interface ChatMessage {
  username: string;
  message : string;
  time: string;
  type: string;
  channel? : string;
}
