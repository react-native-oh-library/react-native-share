export enum Social {
  Facebook = 'facebook',
  Generic = 'generic',
  FacebookStories = 'facebookstories',
  Pagesmanager = 'pagesmanager',
  Twitter = 'twitter',
  Whatsapp = 'whatsapp',
  Whatsappbusiness = 'whatsappbusiness',
  Instagram = 'instagram',
  InstagramStories = 'instagramstories',
  Googleplus = 'googleplus',
  Email = 'email',
  Pinterest = 'pinterest',
  Linkedin = 'linkedin',
  Sms = 'sms',
  Telegram = 'telegram',
  Snapchat = 'snapchat',
  Messenger = 'messenger',
  Viber = 'viber',
  Discord = 'discord',
  Weibo = 'weibo',
  Douyin = 'douyin',
  Testshare = 'testshare'
}
export interface SocialType {
  WEIBO?: string;
  DOUYIN?: string;
  TESTSHARE?: string;
  FACEBOOK?: string;
  FACEBOOKSTORIES?: string;
  TWITTER?: string;
  GOOGLEPLUS?: string;
  WHATSAPP?: string;
  INSTAGRAM?: string;
  INSTAGRAMSTORIES?: string;
  TELEGRAM?: string;
  EMAIL?: string;
  MESSENGER?: string;
  VIBER?: string;
  PAGESMANAGER?: string;
  WHATSAPPBUSINESS?: string;
  PINTEREST?: string;
  LINKEDIN?: string;
  SNAPCHAT?: string;
  SHARE_BACKGROUND_IMAGE?: string;
  SHARE_BACKGROUND_VIDEO?: string;
  SHARE_STICKER_IMAGE?: string;
  SHARE_BACKGROUND_AND_STICKER_IMAGE?: string;
  SHARE_ATTRIBUTION_URL?: string;
  SMS?: string;
  GENERIC?: string;
  DISCORD?: string;
}

export enum ShareMEMIType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  TEXT_PAIN = 'TEXT_PAIN',
}

interface BaseShareSingleOptions {
  urls?: string[];
  url?: string;
  type?: string;
  filename?: string;
  message?: string;
  title?: string;
  subject?: string;
  email?: string;
  recipient?: string;
  social: Exclude<Social, Social.FacebookStories | Social.InstagramStories>;
}

interface BaseSocialStoriesShareSingleOptions extends Omit<BaseShareSingleOptions, 'social'> {
  backgroundImage?: string;
  stickerImage?: string;
  backgroundBottomColor?: string;
  backgroundTopColor?: string;
  attributionURL?: string;
  backgroundVideo?: string;
}

export interface InstagramStoriesShareSingleOptions extends BaseSocialStoriesShareSingleOptions {
  social: Social.InstagramStories;
}

export interface FacebookStoriesShareSingleOptions extends BaseSocialStoriesShareSingleOptions {
  social: Social.FacebookStories;
}

export type ShareSingleOptions =
  | BaseShareSingleOptions
  | InstagramStoriesShareSingleOptions
  | FacebookStoriesShareSingleOptions;

export interface ShareOptions {
  social?: string;
  message?: string;
  title?: string;
  url?: string;
  urls?: string[];
  type?: string;
  subject?: string;
  email?: string;
  recipient?: string;
  excludedActivityTypes?: string[];
  failOnCancel?: boolean;
  filename?: string;
  filenames?: string[];
  saveToFiles?: boolean;
}

export interface ShareSingleResult {
  message: string;
  success: boolean;
}

