import * as line from '@line/bot-sdk';

export type LineNotifierArg = {
  to: string;
  channelAccessToken: string;
};

export type LineMessage = line.messagingApi.Message;

export type LinePushMessageRequest = line.messagingApi.PushMessageRequest;
