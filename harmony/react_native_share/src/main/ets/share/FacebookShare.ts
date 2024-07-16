import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
export class FaceBookShare extends ShareBaseInstance {

  constructor() {
    super("com.facebook.katana", 'facebook://', '123', 'https://www.facebook.com/sharer/sharer.php')
  }
  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let want: Want = {
      entities: ['entity.system.browsable'],
      uri: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options.url)}`,
      action: 'ohos.want.action.viewData'
    }
    const res = await this.shareWant(want,context);
    return res;
  }
}