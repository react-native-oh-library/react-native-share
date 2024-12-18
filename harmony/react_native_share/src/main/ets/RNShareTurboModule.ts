/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { TurboModule } from "@rnoh/react-native-openharmony/ts";
import { TM } from "@rnoh/react-native-openharmony/generated/ts";
import common from '@ohos.app.ability.common'
import { ShareOptions, SocialType, Social, ShareSingleOptions } from './Types';
import { ShareBaseInstance, WeiboShare, DouyinShare, FaceBookShare, SnapChatShare, GenericShare, MessengerShare, TwitterShare, TeleGramShare, PinterestShare, GooglePlusShare, ViberShare, WhatsAppBusinessShare, WhatsAppShare, SMSShare, DiscordShare, EmailShare, InstagramShare, InstagramStoriesShare, LinkedinShare, FacebookStoriesShare } from './share/Share';
import { FileUtils } from './utils/FileUtils';
import { TestShare } from './share/TestShare';
import { JSON } from '@kit.ArkTS';


export class RNShareTurboModule extends TurboModule implements TM.RNShare.Spec {
      private context: common.UIAbilityContext;
      constructor(ctx) {
            super(ctx);
            this.context = this.ctx.uiAbilityContext;
      }
      /**
       * @param options 分享参数
       * @returns ShareBaseInstance 分享基类
       * */
      private getWantShareInstance(options: ShareOptions): ShareBaseInstance {
            let share: Social = options.social as Social;
            let shareInstance: ShareBaseInstance;
            switch (share) {
                  case Social.Generic:
                        shareInstance = new GenericShare();
                        break;
                  case Social.Facebook:
                        shareInstance = new FaceBookShare();
                        break;
                  case Social.FacebookStories:
                        shareInstance = new FacebookStoriesShare();
                        break;
                  case Social.Twitter:
                        shareInstance = new TwitterShare();
                        break;
                  case Social.Whatsapp:
                        shareInstance = new WhatsAppShare();
                        break;
                  case Social.Whatsappbusiness:
                        shareInstance = new WhatsAppBusinessShare();
                        break;
                  case Social.Instagram:
                        shareInstance = new InstagramShare();
                        break;
                  case Social.InstagramStories:
                        shareInstance = new InstagramStoriesShare();
                        break;
                  case Social.Googleplus:
                        shareInstance = new GooglePlusShare();
                        break;
                  case Social.Email:
                        shareInstance = new EmailShare();
                        break;
                  case Social.Pinterest:
                        shareInstance = new PinterestShare();
                        break;
                  case Social.Sms:
                        shareInstance = new SMSShare();
                        break;
                  case Social.Snapchat:
                        shareInstance = new SnapChatShare();
                        break;
                  case Social.Messenger:
                        shareInstance = new MessengerShare();
                        break;
                  case Social.Linkedin:
                        shareInstance = new LinkedinShare();
                        break;
                  case Social.Telegram:
                        shareInstance = new TeleGramShare();
                        break;
                  case Social.Viber:
                        shareInstance = new ViberShare();
                        break;
                  case Social.Discord:
                        shareInstance = new DiscordShare();
                        break;
                  case Social.Weibo:
                        shareInstance = new WeiboShare();
                        break;
                  case Social.Douyin:
                        shareInstance = new DouyinShare();
                        break;
                  case Social.Testshare:
                        shareInstance = new TestShare();
                        break;
                  default:
                        shareInstance = null;
            }
            return shareInstance;
      }
      /**
       * @param 无
       * @returns 字典dictionary  包含所有分享三方的APP名称
       * */
      public getConstants(): SocialType {
            return {
                  "WEIBO": "weibo",
                  "DOUYIN": "douyin",
                  "TESTSHARE": 'testshare',
                  "FACEBOOK": "facebook",
                  "FACEBOOKSTORIES": "facebookstories",
                  "TWITTER": "twitter",
                  "GOOGLEPLUS": "googleplus",
                  "WHATSAPP": "whatsapp",
                  "WHATSAPPBUSINESS": "whatsappbusiness",
                  "INSTAGRAM": "instagram",
                  "INSTAGRAMSTORIES": "instagramstories",
                  "PINTEREST": "pinterest",
                  "TELEGRAM": "telegram",
                  "EMAIL": "email",
                  "MESSENGER": "messenger",
                  "VIBER": "viber",
                  "SMS": "sms",
                  "DISCORD": "discord",
                  "SNAPCHAT": "snapchat"
            }
      };
      /**
       * @param options 分享传参
       * @returns Promise <{success:boolean,message:string}>
       * */
      public async open(options: ShareOptions): Promise<{ success: boolean, message: string }> {

            let shareInstance: ShareBaseInstance = this.getWantShareInstance({ ...options, social: Social.Generic });
            const res = await shareInstance.openSingleWant(options, this.context);
            return res;
      };
      /**
       * @param options 分享到三方APP 参数
       * @returns Promise <{success:boolean,message:string}>
       * */
      public async shareSingle(options: ShareSingleOptions): Promise<{ success: boolean, message: string }> {
            const context = this.context as common.UIAbilityContext;
            let shareInstance: ShareBaseInstance = this.getWantShareInstance(options);
            if (!shareInstance) {
                  return { success: false, message: 'not support share the package' }
            }
            let res = await shareInstance.shareSingleWant(options, context);
            return res;

      };
      /**
       * @param name 三方APP的包名：取getConstants（）里面的三方库包名
       * @returns Promise <{bo:boolean}>
       * */
      public async isPackageInstalled(packageName: string): Promise<boolean> {
            let shareInstance: ShareBaseInstance = this.getWantShareInstance({ social: packageName });
            return await shareInstance.isInstalledPackage();

      };
      /**
       * @param url 文件的URL字符串
       * @returns  Promise <{bo:boolean}>
       * */
      public async isBase64File(url: string): Promise<boolean> {
            return FileUtils.getInstance().isBase64File(url);
      }
}