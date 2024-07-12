import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import wantConstant from '@ohos.app.ability.wantConstant';
import { FacebookStoriesShareSingleOptions, ShareOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import { FileUtils } from '../utils/FileUtils';

export class FacebookStoriesShare extends ShareBaseInstance {
  constructor() {
    super("com.facebook.katana", 'facebook-stories://share', '123')
  }

  public async shareSingleWant(options: FacebookStoriesShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let fileUtil = FileUtils.getInstance();
    if (fileUtil.hasValidKey("backgroundImage", options) && fileUtil.hasValidKey("backgroundVideo", options)
      && fileUtil.hasValidKey("stickerImage", options)) {
      throw ("Invalid background or sticker assets provided.");
    }
    let want: Want = {
      deviceId: '',
      bundleName: this.bundleName,
      uri: options.backgroundVideo ? options.backgroundVideo : options.backgroundImage,
      type: fileUtil.hasValidKey("backgroundVideo", options) ? 'video/*' : 'image/*',
      action: 'ohos.want.action.sendData',
      flags: wantConstant.Flags.FLAG_AUTH_READ_URI_PERMISSION | wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION,
      parameters: {
        'ability.params.backToOtherMissionStack': true,
      }
    }

    const res = await this.shareWant(want,context);
    return res;
  }
}