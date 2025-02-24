export interface Notifier<To = string, Message = unknown, Response = unknown> {
  pushMessage(to: To, msg: Message): Promise<Response>;
}

export interface NotifierConstructor<
  Arg = unknown,
  To = string,
  Message = unknown,
  Response = unknown,
> {
  new (arg: Arg): Notifier<To, Message, Response>;
}
