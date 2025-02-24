export interface Notifier<To = string, Message = unknown, Response = unknown> {
  pushMessage(to: To, msg: Message): Promise<Response>;
}
