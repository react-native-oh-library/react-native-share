import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import { FileUtils } from '../utils/FileUtils';
import Logger from '../utils/Logger';


export class InstagramShare extends ShareBaseInstance {

  constructor() {
    super("com.instagram.android", 'instagram://', '123')
  }

  private async openInstagramIntentChooserForText(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    return super.shareSingleWant(options, context);
  }
  private async openInstagramIntentChooserForMedia(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let type = options.type;
    let isImage = type?.startsWith('image');
    let want: Want = {
      deviceId: '',
      bundleName: this.bundleName,
      uri: options.url,
      type: isImage ? 'image/*' : 'video/*',
      action: 'ohos.want.action.sendData',
      parameters: {
        'ability.params.backToOtherMissionStack': true,
      }
    }
    const res = await this.shareWant(want,context);
    return res;
  }
  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    if (!FileUtils.getInstance().hasValidKey("type", options)) {
      Logger.warn("RNShare", "No type provided");
      return { success: false, message: 'RNShare: No type provided' }
    }
    let type = options.type;
    if (type.startsWith("text")) {
      return this.openInstagramIntentChooserForText(options, context);

    }
    if (!FileUtils.getInstance().hasValidKey("url", options)) {
      Logger.warn("RNShare", "No url provided");
      return { success: false, message: 'RNShare: No url provided' }
    }
    let url = options.url;
    if (url.startsWith("instagram://")) {
      return this.openSingleWant(options, context);
    }
    if (type.startsWith("image")) {
      return this.openInstagramIntentChooserForMedia(options, context);
    }

  }

}