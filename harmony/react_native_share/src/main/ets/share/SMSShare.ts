
import { ShareBaseInstance } from './ShareBaseInstance';
import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import {ShareSingleOptions, ShareSingleResult } from '../Types';

export class SMSShare extends ShareBaseInstance {

  constructor() {
    super("com.ohos.mms", '', '123')
  }
  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let contactInfo = [{
      contactsName: 'ZhangSan',
      telephone: options?.recipient
    }];
    let content = options?.message+'\n'+options?.url;
    let want = {
      bundleName: 'com.ohos.mms',
      abilityName: 'com.ohos.mms.MainAbility',
      parameters: {
        contactObjects: JSON.stringify(contactInfo),
        pageFlag: 'conversation',
        content:content
      }
    };
    const res = await super.shareWant(want, context);
    return res;
  }
}