export interface MessageClient<Message = unknown, Response = unknown> {
  pushMessage(arg: Message): Promise<Response>;
}
