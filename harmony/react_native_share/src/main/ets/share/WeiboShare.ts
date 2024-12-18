/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import wantConstant from '@ohos.app.ability.wantConstant';
import { ShareOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import systemDateTime from '@ohos.systemDateTime';
import { MultiImageObject, TextObject, VideoSourceObject, WeiboMultiMessage } from './shareMediaObject/ShareMediaObject';

export class WeiboShare extends ShareBaseInstance {
  public static readonly COMMAND_TO_WEIBO = 1;

  public static readonly COMMAND_SSO = 3;

  public static readonly WEIBO_SDK_VERSION_CODE = "0041005000";

  public static readonly WEIBO_SDK_FLAG = 538116905;

  public static readonly WEB_TYPE_SHARE = 1;

  constructor() {
    super("com.sina.weibo.stage", 'sinaweibo://share', '123', 'service.weibo.com/share/share.php')
  }
  private async createMessage(options: ShareOptions) {
    let message: WeiboMultiMessage = new WeiboMultiMessage();
    let textObject = new TextObject();
    textObject.text = options.title;
    textObject.description = options.subject;
    message.textObject = textObject;
    let multiImage = new MultiImageObject();
    multiImage.uriStrs = options.urls;
    message.multiImageObject = multiImage;
    let videoObj = new VideoSourceObject();
    videoObj.videoPath = options.url;
    message.videoSourceObject = videoObj;
    return message;
  }

  public async shareSingleWant(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    const message = await this.createMessage(options);

    // 处理视频和图片同时存在时，分享视频
    if (message.multiImageObject != null && message.videoSourceObject != null) {
      message.multiImageObject = null;
    }
    let uriStrs: string[] = new Array<string>();

    if (message.multiImageObject?.uriStrs != null) {
      uriStrs = message.multiImageObject?.uriStrs;
    }
    if (message.videoSourceObject?.videoPath != null) {
      uriStrs.push(message.videoSourceObject.videoPath);
      uriStrs.push(message.videoSourceObject.coverPath);
    }
    let want: Want = {
      deviceId: '', // deviceId为空表示本设备
      bundleName: 'com.sina.weibo.stage',
      moduleName: 'entry', // moduleName非必选
      abilityName: 'EntryAbility',
      uri: 'sinaweibo://share',
      action: 'ohos.want.action.sendData',
      flags: wantConstant.Flags.FLAG_AUTH_READ_URI_PERMISSION | wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION,
      parameters: {
        packagename: 'com.rnoh.tester',
        callbackability: 'EntryAbility',
        _weibo_command_type: WeiboShare.COMMAND_TO_WEIBO,
        _weibo_flag: WeiboShare.WEIBO_SDK_FLAG,
        _weibo_transaction: systemDateTime.getTime(false) + "",
        msg: message,
        "ability.params.stream": uriStrs
      }
    }
   const res = await this.shareWant(want,context);
   return res;
  }
}