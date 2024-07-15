import { ShareOptions, ShareSingleResult, ShareSingleOptions } from '../Types';
import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import uri from '@ohos.uri';
import bundleManager from '@ohos.bundle.bundleManager';
import pasteboard from '@ohos.pasteboard';
import Logger from '../utils/Logger';
import { BusinessError } from '@kit.BasicServicesKit';


export class ShareBaseInstance {
/**
 * @description create a share instance 构建分享实体
 * @param bundleName:app bundleName 三方APP包名
 * @param scheme:  supported scheme in third app 三方APP支持的分享协议scheme
 * @param storeId: appid 三方APP的appid
 * @param shareUrl: share url 三方APP的分享链接
 * */
  constructor(public bundleName: string, public scheme: string, public storeId: string, public shareUrl?: string) {
    this.bundleName = bundleName;
    this.storeId = storeId;
    this.scheme = scheme;
    this.shareUrl = shareUrl;
  }

  /**
   * @description share something to third app 分享信息至三方APP
   * @param options:ShareSingleOptions contain share params 分享参数
   * @param context: UIAbilityContext Ability上下文
   * @returns Promise<{message: string,success: boolean}> 返回值Promise
   * */
  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {

    let want: Want = {
      deviceId: '',
      bundleName: this.bundleName,
      uri: options.url,
      action: 'ohos.want.action.sendData',
      parameters: {
        'ability.params.backToOtherMissionStack': true,
        'ohos.extra.param.key.shareUrl': options.url,
        'ohos.extra.param.key.contentTitle': options.title,
        'ohos.extra.param.key.shareAbstract': options.subject,
      }
    }
   const res = await this.shareWant(want,context);
    return res;

  };
  /**
   * @description pull third app  want information to share something 拉起三方APP分享信息
   * @param context: UIAbilityContext Ability上下文
   * @returns Promise<{message: string,success: boolean}> 返回值Promise
   * */
 public  async  shareWant(want:Want,context:common.UIAbilityContext): Promise<ShareSingleResult>{
   try {
     await context.startAbility(want);
     return { success: true, message: 'success to share '+this.bundleName }
   } catch (err) {
     const error = err as BusinessError;
     Logger.error(`Failed to share ${this.bundleName}: code:${error.code},meessage:${error.message}`);
     if (error.code === 16000001) {

           // go to haiWei market 跳转到华为商城
           this.shareHWMarket(this.storeId, context);
     }
     return { success: false, message: error.message }
   }
 }
  /**
   * @description pull system share to share info 拉起系统面板分享
   * @param context: UIAbilityContext 上下文
   * @returns Promise<{message: string,success: boolean}> 返回值Promise
   * */
  public async openSingleWant(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {

    let want: Want = {
      deviceId: '',
      bundleName: this.bundleName,
      uri: new uri.URI(options.url).toString(),
      action: 'ohos.want.action.viewData',
      parameters: {
        'ability.params.backToOtherMissionStack': true
      }
    }
    const res = await this.shareWant(want,context);
    return res;
  }
  /**
   * @description go to haiWei market download app 去华为商城
   * @param storeId: appid in app market 三方APP的appid
   * @param context: UIAbilityContext 上下文
   * @returns Promise<{message: string,success: boolean}> 返回值Promise
   * */
  public async shareHWMarket(storeId: string, context: common.UIAbilityContext): Promise<ShareSingleResult> {

    let want: Want = {
      uri: `store://appgallery.huawei.com/app/detail?id=C${storeId}`
    }
    try {
      await context.startAbility(want);
      return { success: true, message: 'success to open market' }
    } catch (err) {
      let error = err as BusinessError;
      Logger.error(`Failed to open  ${this.bundleName} in market: code:${error.code},meessage:${error.message}`);
      return { success: false, message: error.message }
    }
  };
  /**
   * @description the app  is or not installed  in the device APP是否已在本机上安装
   * @returns Promise<{success: boolean}> 返回值boolean
   * */
  public async isInstalledPackage(): Promise<boolean> {
    try {
      let canTouch = bundleManager.canOpenLink(this.scheme);
      Logger.info('canOpenLink:' + canTouch);
      return canTouch

    } catch (err) {
      let error = err as BusinessError;
      Logger.error(`${this.bundleName} isInstalledPackage fail  : code:${error.code},meessage:${error.message}`);
      return false;
    }
  }
  /**
   * @description copy to pasteboard 粘贴到剪切板
   * @param subject  content 粘贴内容
   * @param MIME MIME type 粘贴数据类型
   */
  protected pastToPasteboard(subject: string, MIME: string) {
    let systemPasteboard = pasteboard.getSystemPasteboard();
    let pasteData = pasteboard.createData(MIME, subject);
    systemPasteboard.clearDataSync();
    systemPasteboard.setDataSync(pasteData);

  }
  /**
   *@description get data from pasteboard 获取剪切板的数据
   */
  protected getPasteboard() {
    let systemPasteBoard = pasteboard.getSystemPasteboard();
    let pasteData = systemPasteBoard.getDataSync();
    return pasteData
  }

}
