import * as line from '@line/bot-sdk';

export type LineMessagingApiClientArg = {
  channelAccessToken: string;
};

export type LineFlexComponent = line.messagingApi.FlexComponent;

export type LineMessage = line.messagingApi.Message;

export type LineMessageArg = {
  to: string;
  messages: LineMessage[];
};
