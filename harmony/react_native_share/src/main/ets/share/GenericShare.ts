/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import fs from '@ohos.file.fs';
import Logger from '../utils/Logger';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import { FileUtils } from '../utils//FileUtils';
import systemShare from '@hms.collaboration.systemShare';
import utd from '@ohos.data.uniformTypeDescriptor';
import { BusinessError } from '@kit.BasicServicesKit';


export class GenericShare extends ShareBaseInstance {
  constructor() {
    super('', '', '123')
  }
  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    return this.openSingleWant(options, context);
  }
  /**
   * @description save files 保存到本地文档
   * @param options: share information  for example url urls 分享的信息
   * @param context:UIAbilityContext 上下文
   * @returns Promise<{success:bool,message:string}> 返回值
   * */
  private async openSaveFiles(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    const fileUtil = FileUtils.getInstance();
    const { urls, fileNames } = await this.normalizeShareOptions(options, context);
    try {
      const res = await fileUtil.saveMultiUrlsDataToDocument(context, urls, fileNames);
      if (res) {
        return { success: true, message: 'saveToFiles  success' }
      }
    } catch (err) {
      const error = err as BusinessError;
      Logger.error(`Failed to  saveToFiles: code:${error.code},meessage:${error.message}`);
      return { success: false, message: error.message }
    }
  }
  /**
   * @description pull system share panel to share something 打开系统分享面板
   * @param options: share information  for example url urls 分享的信息
   * @param context:UIAbilityContext 上下文
   * @returns Promise<{success:bool,message:string}> 返回值
   * */
  private async openSystemShare(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {

    const fileUtil = FileUtils.getInstance();
    const { urls, excludedAbilities } = await this.normalizeShareOptions(options, context);

    // 拉起系统分享面板
    try {

      let data: systemShare.SharedData;
      urls.forEach((url) => {
        let fileUrl = url;
        let utdType: utd.UniformDataType;
        if (fileUtil.isHttpLink(url)) {
          utdType = utd.UniformDataType.HYPERLINK;
        } else {
          let type = fileUtil.getMIMETypeFromExtension(fileUrl);
          utdType = utd.getUniformDataTypeByMIMEType(type) as utd.UniformDataType;
        }
        let title = options?.title;
        let description = options?.subject;
        let param:{utd:string,uri?:string,description:string,title:string,content?:string} = {
          utd: utdType,
          uri: fileUrl,
          description: description,
          title: title
        }
        if(utdType === utd.UniformDataType.HYPERLINK){
          param = {
            utd: utdType,
            content: fileUrl,
            description: description,
            title: title
          }
        }
        if (!data) {
          data = new systemShare.SharedData(param)
        } else {
          data.addRecord(param)
        }

      })
      let controller: systemShare.ShareController = new systemShare.ShareController(data);
      controller.show(context, {
        previewMode: systemShare.SharePreviewMode.DEFAULT,
        selectionMode: systemShare.SelectionMode.SINGLE,
        excludedAbilities: excludedAbilities
      });
      return { success: true, message: 'systemShare success' }
    } catch (err) {
      const error = err as BusinessError;
      Logger.error(`Failed to open system share: code:${error.code},meessage:${error.message}`);
      return { success: false, message: error.message }
    }
  }
  /**
   * @description 转换分享参数
   * @param options: share information  for example url urls 分享的信息
   * @param context:UIAbilityContext 上下文
   * */
  private async normalizeShareOptions(options: ShareOptions, context: common.UIAbilityContext) {
    const fileUtil = FileUtils.getInstance();
    let urls = new Array<string>();
    let fileNames = new Array<string>();
    let excludedAbilities = new Array<systemShare.ShareAbilityType>();
    if (fileUtil.hasValidKey('excludedActivityTypes', options)) {
      excludedAbilities = options.excludedActivityTypes?.map((item) => parseInt(item));
    }
    if (fileUtil.hasValidKey('url', options) && !fileUtil.hasValidKey('urls', options)) {
      urls.push(options.url);
    }
    if (fileUtil.hasValidKey('urls', options)) {
      urls = urls.concat(options.urls)
    }

    if (fileUtil.hasValidKey('filename', options) && !fileUtil.hasValidKey('filenames', options)) {
      fileNames.push(options.filename);
    }
    if (fileUtil.hasValidKey('filenames', options)) {
      fileNames = fileNames.concat(options.filenames)
    }

    if (fileNames.length !== urls.length) {
      fileNames = urls.map((item) => {
        return fileUtil.getFileName(item);
      });
      // 将base64数据转换到本地缓存
      urls = await fileUtil.saveMultiUrlsDataToCache(context, urls, fileNames);
      return {
        excludedAbilities,
        fileNames,
        urls
      }
    }
  }

  /**
   * @description pull system share panel to share something 打开系统分享面板
   * @param options: share information  for example url urls 分享的信息
   * @param context:UIAbilityContext 上下文
   * @returns Promise<{success:bool,message:string}> 返回值
   * */
  public async openSingleWant(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    const fileUtil = FileUtils.getInstance();
    let res;
    if (fileUtil.hasValidKey('saveToFiles', options)) {

      // 不拉起分享面板直接保存到本地
      if (options.saveToFiles) {
        res = await this.openSaveFiles(options, context)
      }
    } else {

      // 拉起系统分享面板
      res = await this.openSystemShare(options, context)
    }
    return res
  }

  /**
   *  @description  choose app to share 选择APP 分享信息
   * @param options:  something to share 分享的信息
   * @param context: UIAbilityContext APP上下文
   * @returns Promise<{message: string,success: boolean}> 返回值
   * */
  public async openChooseWant(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {

    let type = 'text/plain';
    let Util = FileUtils.getInstance();
    let want: Want;
    let filePath = options.url;
    if (Util.isFile(filePath)) {
      type = Util.getMIMETypeFromExtension(filePath);
      let file = fs.openSync(filePath, fs.OpenMode.READ_ONLY);
      let fileSize = fs.statSync(file.fd).size;
      Logger.info('### file info', type, fileSize.toString(), file.name, file.fd.toString())
      want = {
        action: 'ohos.want.action.select',
        parameters: {
          'ability.picker.type': type,
          'ability.picker.fileNames': [file.name],
          'ability.picker.fileSizes': [fileSize],
          'ability.want.params.INTENT': {
            action: 'ohos.want.action.sendData',
            type: type,
            parameters: {
              'ability.params.backToOtherMissionStack': true,
              'keyFd': { 'type': 'FD', 'value': file.fd }
            }
          }
        }
      }
    } else {
      want = {
        "action": "ohos.want.action.select",
        "type": "text/plain",
        parameters: {
          'ability.want.params.INTENT': {
            action: 'ohos.want.action.viewData',
            "entities": ["entity.system.browsable"],
            type: type,
            uri: filePath,
            parameters: {
              'ability.params.backToOtherMissionStack': true,
            }
          }
        }
      }

    }
    try {
      await context.startAbility(want);
      return { success: true, message: 'success to open App ' }
    } catch (err) {
      const error = err as BusinessError;
      Logger.error(`Failed to open system share: code:${error.code},meessage:${error.message}`);
      return { success: false, message: error.message }
    }

  }
}