export interface Notifier<Message = unknown, Response = unknown> {
  pushMessage(arg: Message): Promise<Response>;
}

export interface NotifierConstructor<Arg = unknown, Message = unknown, Response = unknown> {
  new (arg: Arg): Notifier<Message, Response>;
}
