export interface Notifier<Message = unknown, Response = unknown> {
  pushMessage(arg: Message): Promise<Response>;
}
