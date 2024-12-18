/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import fs, { ReadOptions } from '@ohos.file.fs';
import { BusinessError } from '@ohos.base'
import picker from '@ohos.file.picker';
import contextConstant from '@ohos.app.ability.contextConstant';
import image from '@ohos.multimedia.image';
import fileUri from '@ohos.file.fileuri';
import http from '@ohos.net.http';
import Logger from './Logger';
import buffer from '@ohos.buffer';
import uri from '@ohos.uri';
import common from '@ohos.app.ability.common';
import filePreview from '@hms.filemanagement.filepreview';
import util from '@ohos.util';
import { JSON } from '@kit.ArkTS';


export class FileUtils {
  private static sInstance: FileUtils;

  public static mimeTypes = {
    '.3gp': 'video/3gpp',
    '.aac': 'audio/x-aac',
    '.aiff': 'audio/aiff',
    '.avi': 'video/x-msvideo',
    '.bmp': 'image/bmp',
    '.csv': 'text/csv',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.flash': 'application/x-shockwave-flash',
    '.gif': 'image/gif',
    '.gz': 'application/x-gzip',
    '.html': 'text/html',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.ogg': 'audio/ogg',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.rtf': 'application/rtf',
    '.svg': 'image/svg+xml',
    '.swf': 'application/x-shockwave-flash',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.txt': 'text/plain',
    '.wav': 'audio/x-wav',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.xml': 'text/xml',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'gzip': 'application/x-gzip',
    'gz': 'application/x-gzip',
    'zip': 'application/zip',
    'rar': 'application/rar',
    'tgz': 'application/x-tar',
    'tar': 'application/x-tar',
  };
  public static getInstance(): FileUtils {
    if (!FileUtils.sInstance) {
      FileUtils.sInstance = new FileUtils();
    }
    return FileUtils.sInstance;
  }

  private constructor() {
    Logger.info("FileUtils - FileUtils constructor")
  }
  isValidKey(key: string, options: object) {
    return options != null && options[key];
  }
  hasValidKey(key: string, options: object) {
    return options != null && options[key] && !options[key] != null;
  }
  getUrlSuffix(url: string) {
    let suffix = '';
    if (this.isBase64File(url)) {
      let data = url.split(',');
      let typeStr = data[0].match(/:(.*?);/)[1];
      suffix = '.' + typeStr.substring(typeStr.lastIndexOf("/") + 1);
    } else {
      suffix = url.substring(url.lastIndexOf("."));
      let fileMIMEType = FileUtils.mimeTypes?.[suffix.toLowerCase()]
      if (!fileMIMEType) {
        if (this.isHttpLink(url)) {
          suffix = '';
        } else {
          throw ('url is not a support file')
        }
      }
    }
    return suffix;
  }
  isBase64File(url: string) {
    let scheme = new uri.URI(url).scheme;
    if ((scheme != null) && scheme === 'data' && url.indexOf('base64') != -1) {
      return true;
    }
    return false;
  }

  /**
   * @description 获取文件路径的MimeType
   */
  getMIMETypeFromExtension(url: string) {
    const fileSuffix = this.getUrlSuffix(url);
    let fileMIMEType = FileUtils.mimeTypes[fileSuffix.toLowerCase()]
    return fileMIMEType;
  }
  /**
   * @description 根据文件的MimeType获取文件名后缀
   */
  getTypeFromMIMEType(mime: string) {
    let type = '';
    let mimeTypes = FileUtils.mimeTypes;
    let mimeTypeKeys = Object.keys(mimeTypes);
    for (let key of mimeTypeKeys) {
      if (mime === mimeTypes[key]) {
        type = key;
        break;
      }
    }
    return type;
  }
  isLocalFile(url: string): boolean {
    let scheme = new uri.URI(url).scheme;
    if ((scheme != null && scheme === "content") || scheme === "file") {
      return true;
    }
    return false;
  }
  isHttpLink(url: string): boolean {
    let scheme = new uri.URI(url).scheme;
    if (scheme != null && scheme.startsWith("http")) {
      return true;
    }
    return false;
  }
  getFileName(url: string): string {
    let fileName: string = '';

    if (this.isBase64File(url)) {
      fileName = util.getHash({ url }).toString();
    } else {
      let n = url.lastIndexOf('/');
      let start = n > 0 ? n + 1 : 0
      let end = url.lastIndexOf('.');
      fileName = url.substring(start, end);
      if (fileName.indexOf('/') > 0 || fileName.indexOf('.') > 0) {
        fileName = util.getHash({ url }).toString();
      }
    }
    if (fileName.length > 50) {
      fileName = fileName.substring(0, 50);
    }
    return fileName;
  }
  decodeBase64(data: string): string {
    return buffer.from(data, 'base64').toString('utf8');
  }
  imageToBase64(filePath: string, bufferLen = 409600) {
    try {
      const file = fs.openSync(filePath, fs.OpenMode.READ_WRITE);
      const arrayBuffer = new ArrayBuffer(bufferLen);
      const readLen = fs.readSync(file.fd, arrayBuffer);
      const buf = buffer.from(arrayBuffer, 0, readLen);
      const base64 = buf.toString('base64');
      fs.closeSync(file);
      return base64;
    } catch (e) {
      Logger.error('file err:', JSON.stringify(e));
      return ''
    }
  }
  /**
   * @param context 上下文
   * @param url base64 URL字符串
   * @param fileName 文件名称（不需有后缀名）如 123
   * @returns 返回 Promise<URI字符串>
   * */
  writeBase64File(context: common.UIAbilityContext, url: string, fileName?: string): string {
    const bo = this.isBase64File(url);
    if (!bo) {
      throw ('url is not a base64 file')
    }
    try {
      let path: string = this.getCacheFile(context, 'share_cache');
      if (!fs.accessSync(path)) {
        fs.mkdirSync(path);
      }
      let suffix = this.getUrlSuffix(url);
      let name = fileName ? (fileName + suffix) : new Date().getTime().toString() + suffix;
      let completePath = path + '/' + name;
      this.writeUriFromBase64URL(completePath, url);
      return fileUri.getUriFromPath(completePath).toString();
    } catch (err) {
      Logger.error("err code = " + err.code + ", err msg = " + err.message);
      throw err
    }
  }
  /**
   * @description base64URL写入URI
   * @param url base64Url
   * @param uri 写入的URI路径
   */
  writeUriFromBase64URL(uri: string, url: string) {

    let fd = fs.openSync(uri, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd
    let encodedData = url.split(',')[1];
    let decodeData = buffer.from(encodedData, 'base64').buffer;
    let writeLen = fs.writeSync(fd, decodeData);
    fs.closeSync(fd);
    Logger.info('file fd: ' + fd);
    Logger.info('write data to file succeed and size is:' + writeLen);
  }
  /**
   * @description 请求网络数据URL写入URI
   * @param url 网络文件地址
   * @param uri 写入URI路径
   */
  writeUriFromHttpURL(uri: string, url: string): Promise<{ success: boolean, message: string }> {
    let promise = new Promise<{ success: boolean, message: string }>((resolve, reject) => {
      try {
        let fd = fs.openSync(uri, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd;
        let totalSize = 0;
        let httpRequest = http.createHttp();

        httpRequest.requestInStream(url,
          { method: http.RequestMethod.GET, connectTimeout: 600000, }, (err: BusinessError, code: number) => {
            if (!err) {
              Logger.info('requestInStream  is ok', code.toString());
            } else {
              err && Logger.error('requestInStream  error', JSON.stringify(err));
              reject({ code: err.code, message: 'http requestInStream:' + err.message })
            }
          });
        httpRequest.on("dataReceive", (data: ArrayBuffer) => {
          Logger.info('requestInStream dataReceive');
          let writeLen = fs.writeSync(fd, data);
          totalSize = totalSize + writeLen;
        });
        httpRequest.on("dataEnd", () => {
          Logger.info('requestInStream dataEnd');
          fs.closeSync(fd);
          resolve({ success: true, message: 'download data success' })
        })
      } catch (err) {
        reject(err)
      }

    })
    return promise
  }
  /**
   * @description write http data 下载网络数据到缓存
   * @param context 上下文
   * @param url  URL字符串
   * @param fileName 文件名称（不需有后缀名）如 123
   * @returns 返回 Promise<string>
   * */
  async writeHttpFile(context: common.UIAbilityContext, url: string, fileName?: string): Promise<string> {
    const bo = this.isHttpLink(url);
    if (!bo) {
      throw ('url is not a http file')
    }
    try {
      let path: string = this.getCacheFile(context, 'share_cache');
      if (!fs.accessSync(path)) {
        fs.mkdirSync(path);
      }
      let suffix = this.getUrlSuffix(url);
      let name = fileName ? (fileName + suffix) : new Date().getTime().toString() + suffix;
      let completePath = path + '/' + name;
      const { success } = await this.writeUriFromHttpURL(completePath, url);
      if (success) {
        return fileUri.getUriFromPath(completePath);
      } else {
        return url;
      }

    } catch (err) {
      Logger.error("err code = " + err.code + ", err msg = " + err.message);
      return url
    }
  }
  /**
   * @description write http data 写入txt文件
   * @param url  要写入的字符串
   * @param uri 写入的目的位置
   * @returns 返回 Promise<string>
   * */
  writeTextFile(uri: string, content: string) {
    try {
      let fd = fs.openSync(uri, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd;
      fs.writeSync(fd, content);
      fs.closeSync(fd);
    } catch (err) {
      Logger.error("err code = " + err.code + ", err msg = " + err.message);
      throw err
    }
  }
  /**
   * @param urls 文件的地址（base64 本地 网络图片）
   * @param fileNames 文件名称不带后缀如 ['file01'，'file02']
   * @returns 返回 Promise<URI[]>
   * */
  async saveMultiUrlsDataToCache(context: common.UIAbilityContext, urls: string[], fileNames: string[]): Promise<string[]> {

    try {
      if (urls?.length !== fileNames.length) {
        Logger.error('urls length not equal fileNames length')
        throw new Error('urls not equal fileNames')
      }
      let uris = new Array<string>();
      for (let index = 0; index < urls.length; index++) {
        const url = urls[index];
        const name = fileNames[index];
        if (this.isBase64File(url)) {
          const uri = this.writeBase64File(context, url, name);
          uris.push(uri);
        } else if (this.isHttpLink(url)) {
          uris.push(url);
        } else if (this.isLocalFile(url)) {
          uris.push(url)
        } else {
          throw new Error('urls contain not defined file')
        }
      }
      return uris;
    } catch (err) {
      Logger.error(`save cache failed, code is ${err.code}, message is ${err.message}`);
      throw (err)
    }
  }
  /**
   * @param urls 文件的地址（base64 本地 网络图片）
   * @param fileNames 文件名称不带后缀如 [123]
   * @returns 返回 Promise<URI[]>
   * */
  async saveMultiUrlsDataToDocument(context: common.UIAbilityContext, urlArr: string[], fileNamesArr: string[]) {
    try {
      if (urlArr?.length !== fileNamesArr.length) {
        Logger.error('urls length not equal fileNames length')
        throw (new Error('urls length not equal fileNames length'))
      }

      // 清除无效的下载链接 （如网址）
      let urls = new Array<string>();
      let suffixNames= new Array<string>();
      urlArr.forEach((item, index) => {
        let suffix = this.getUrlSuffix(item);
        if(suffix){
          urls.push(item);
          suffixNames.push( fileNamesArr[index] + suffix)
        }
      })

      // 创建文件管理器选项实例
      const documentSaveOptions = new picker.DocumentSaveOptions();

      // 保存文件名（可选）
      documentSaveOptions.newFileNames = suffixNames;
      const documentViewPicker = new picker.DocumentViewPicker(context);
      let uris: string[];
      const documentSaveResult = await documentViewPicker.save(documentSaveOptions);
      uris = documentSaveResult;
      Logger.info('documentViewPicker.save  file uris are:' + uris);
      for (let index = 0; index < uris.length; index++) {
        const uri = uris[index];
        const url = urls[index];
        if (this.isBase64File(url)) {
          this.writeUriFromBase64URL(uri, url)
        } else if (this.isHttpLink(url)) {
            this.writeUriFromHttpURL(uri, url);
        } else if (this.isLocalFile(url)) {
          this.copyUriFromUrl(uri, url);
        } else {
          Logger.info('url is not support file')
        }
      }
      return uris;
    } catch (err) {
      throw err
    }

  }

  /**
   * Return an if the url is a file (local or base64)l
   * @return {@link boolean}
   */
  isFile(url: string): boolean {
    return this.isBase64File(url) || this.isLocalFile(url);
  }
  /*
   * @param context 上下文
   * @param uri 本地路径地址URI
   * **/
  previewFile(context: common.UIAbilityContext, uriStr: string) {
    let type = this.getMIMETypeFromExtension(uriStr);
    let displayInfo: filePreview.DisplayInfo = {
      x: 100,
      y: 100,
      width: 800,
      height: 800
    };
    let fileInfo: filePreview.PreviewInfo = {
      title: '预览',
      uri: uriStr,
      mimeType: type
    };
    filePreview.openPreview(context, fileInfo, displayInfo).then(() => {
      Logger.info('Succeeded in openPreview', uriStr, type);
    }).catch((err: BusinessError) => {
      Logger.error(`Failed to openPreview, err.code = ${err.code}, err.message = ${err.message}`);
    });
  }
  /**
   * @param context 上下文
   * @param fileName 文件名称（需要后缀名）如 123.png
   * @returns 返回 <URI字符串>
   * */
  saveSourceImageFile(context: common.UIAbilityContext, fileName: string, resourceName: string) {
    try {
      let path: string = this.getImageCacheFile(context);
      if (!fs.accessSync(path)) {
        fs.mkdirSync(path);
      }
      let imagePath = path + '/' + fileName;
      this.writeToUriFromResourceData(context, imagePath, resourceName);
      return fileUri.getUriFromPath(imagePath);
    } catch (e) {
      let err = e
      Logger.error("err code = " + err.code + ", err msg = " + err.message);
      return ''
    }
  }

  saveImageByPixelMap(pixelMap: image.PixelMap, context: common.UIAbilityContext): Promise<string> {
    const imagePackerApi = image.createImagePacker();
    let packOpts: image.PackingOption = { format: "image/jpeg", quality: 98 };
    return imagePackerApi.packing(pixelMap, packOpts)
      .then((data: ArrayBuffer) => {
        // data 为打包获取到的文件流，写入文件保存即可得到一张图片
        try {
          let path: string = this.getImageCacheFile(context);
          if (!fs.accessSync(path)) {
            fs.mkdirSync(path);
          }
          let completePath = path + '/' + 'cover_' + new Date().getTime() + '.jpg'
          let fd = fs.openSync(completePath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd;
          fs.writeSync(fd, data);
          fs.closeSync(fd);
          return fileUri.getUriFromPath(completePath)
        } catch (e) {
        }
        return ''
      })
  }
  /**
   * @param context 上下文
   * @param fileName 文件名称（需要后缀名）如 123.png
   * @returns 返回 <URI字符串>
   * */
  saveSourceVideoFile(context: common.UIAbilityContext, fileName: string, resourceName: string) {

    try {
      let path: string = this.getVideoCacheFile(context);
      if (!fs.accessSync(path)) {
        fs.mkdirSync(path);
      }
      let videoPath = path + '/' + fileName;
      this.writeToUriFromResourceData(context, videoPath, resourceName);
      return fileUri.getUriFromPath(videoPath);
    } catch (e) {
      let err = e as BusinessError;
      Logger.error("err code = " + err.code + ", err msg = " + err.message);
      return ''
    }
  }

  getImageCacheFile(context: common.UIAbilityContext) {
    return this.getCacheFile(context, 'image_file');
  }
  getVideoCacheFile(context: common.UIAbilityContext) {
    return this.getCacheFile(context, 'video_file');
  }
  writeToUriFromResourceData(context, uri, resourceName) {
    let fd = this.createFile(uri);
    let aArray = context.resourceManager.getMediaByNameSync(resourceName)
    let aBuffer = this.uint8ArrayToBuffer(aArray);
    fs.writeSync(fd, aBuffer);
    fs.closeSync(fd);
  }
  getCacheFile(context: common.UIAbilityContext, namespace: string): string {
    let application = context.getApplicationContext();
    if (application.area === contextConstant.AreaMode.EL2) { // 获取area
      application.area = contextConstant.AreaMode.EL1; // 修改area
    }
    let path: string = application.cacheDir + '/' + namespace;
    return path;
  }
  public isEmpty(str: string | null): boolean {
    return str == undefined || str == null || str.length == 0;
  }
  public isImageFile(uri: uri.URI): boolean {
    return uri.scheme.startsWith('image')

  }
  public isVideoFile(uri: uri.URI): boolean {
    return uri.scheme.startsWith('video')
  }

  public getVideoDuration(path: string): number {
    if (this.isEmpty(path)) {
      return 0;
    }
    try {
      let stat = fs.statSync(path);
      return stat.size;
    } catch (err) {
      let e = err as BusinessError
      Logger.info("err code = " + e.code + ", err msg = " + e.message);
      return 0;
    }
  }
  /**
   * 新建文件
   * @param path 文件绝对路径及文件名
   * @return number 文件句柄id
   */
  createFile(path: string): number {
    return fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd
  }

  /**
   * 删除文件
   * @param path 文件绝对路径及文件名
   */
  deleteFile(path: string): void {
    try {
      let fileExist = fs.accessSync(path);
      if (fileExist) {
        fs.unlinkSync(path);
      }
    } catch (err) {
      Logger.info("FileUtils deleteFile Method has error, err msg=" + (err as BusinessError).message + " err code=" + (err as BusinessError).code);
    }
    picker.PhotoSelectResult.prototype
  }
  /**
   * 异步删除文件
   * @param path 文件绝对路径及文件名
   */
  deleteFileAsync(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.access(path).then(fileExist => {
        if (fileExist) {
          fs.unlink(path).then(() => {
            resolve();
          }).catch((err: BusinessError) => {
            reject(err)
          })
        }
      }).catch((err: BusinessError) => {
        reject(err);
      })
    })
  }



  /**
   * 同步删除文件目录 必须保证文件夹里面没有文件
   * @param path 待删除目录的绝对路径
   */
  deleteFolderSync(path: string): void {
    if (this.existFolder(path)) {
      fs.rmdirSync(path);
    }
  }

  /**
   * 异步删除文件目录  必须保证文件夹里面没有文件
   * @param path 待删除目录的绝对路径
   */
  deleteFolderAsync(path: string, deleteComplete: (value: void) => void | PromiseLike<void>, deleteError: (reason: Object) => PromiseLike<never>) {
    if (this.existFolder(path)) {
      fs.rmdir(path)
        .then(deleteComplete).catch(deleteError);
    }
  }

  /**
   * 拷贝文件
   * @param path 文件绝对路径及文件名
   */
  copyFile(oriPath: string, newPath: string) {
    fs.copyFileSync(oriPath, newPath);
  }

  /**
   * 清空已有文件数据
   */
  clearFile(path: string): number {
    return fs.openSync(path, fs.OpenMode.TRUNC).fd
  }

  /**
   * 向path写入content数据，覆盖旧数据
   */
  writeFile(path: string, content: ArrayBuffer | string) {
    try {
      let fd = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd
      fs.truncateSync(fd)
      fs.writeSync(fd, content)
      fs.fsyncSync(fd)
      fs.closeSync(fd)
    } catch (e) {
      Logger.error("FileUtils - Failed to writeFile for " + e)
    }
  }

  /**
   * 向path写入数据
   */
  writeData(path: string, content: ArrayBuffer | string) {
    try {
      let fd = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd
      let stat = fs.statSync(path)
      Logger.info("FileUtils - writeData size = " + stat.size + " path=" + path);
      fs.writeSync(fd, content, { offset: stat.size })
      fs.closeSync(fd)
    } catch (e) {
      Logger.error("FileUtils - Failed to writeData for " + e)
    }
  }

  /**
   * 判断path文件是否存在
   */
  exist(path: string): boolean {
    try {
      let stat = fs.statSync(path)
      return stat.isFile()
    } catch (e) {
      Logger.error("path=>" + path)
      return false
    }
  }

  /**
   * 判断path文件是否存在
   */
  isFileExist(path: string): boolean {
    try {
      let stat = fs.statSync(path)
      return stat.isFile()
    } catch (e) {
      Logger.error("path=>" + path)
      return false
    }
  }

  /**
   * 向path写入数据
   */
  writePic(path: string, picData: ArrayBuffer) {
    Logger.info("FileUtils - writepic 1")
    this.createFile(path)
    this.writeFile(path, picData)
    Logger.error("FileUtils - writepic 3")
  }

  /**
   * 获取path的文件大小
   */
  getFileSize(path: string): number {
    try {
      let stat = fs.statSync(path)
      return stat.size
    } catch (e) {
      Logger.error("FileUtils - FileUtils getFileSize e " + e)
      return -1
    }
  }

  /**
   * 同步读取路径path的文件
   */
  readFilePic(path: string): ArrayBuffer {
    try {
      let stat = fs.statSync(path)
      let fd = fs.openSync(path, fs.OpenMode.READ_ONLY).fd;
      let length = stat.size
      let buf = new ArrayBuffer(length);
      fs.readSync(fd, buf)
      fs.closeSync(fd)
      return buf
    } catch (e) {
      Logger.error("FileUtils - readFilePicSync " + e)
      return new ArrayBuffer(0)
    }
  }
  /**
   * 异步读取路径path的文件
   */
  readFilePicAsync(path: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      fs.open(path, fs.OpenMode.READ_ONLY).then((file) => {
        let stat = fs.statSync(path)
        let fd = file.fd;
        let length = stat.size;
        let buf = new ArrayBuffer(length);
        fs.read(fd, buf).then(() => {
          // 关闭文件
          fs.closeSync(file);
          resolve(buf);
        }).catch((err: BusinessError) => {
          reject(err);
        })
      }).catch((err: BusinessError) => {
        reject(err);
      })


    })

  }


  /**
   * @description copy URI data from url
   * @param uri copy to uri
   * @param url copy from url
   */
  copyUriFromUrl(uri: string, url: string) {
    let savefile = fs.openSync(uri, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd;
    let originFile = fs.openSync(url, fs.OpenMode.READ_ONLY).fd;
    fs.copyFileSync(originFile, savefile);
    fs.closeSync(savefile);
    fs.closeSync(originFile);
  }
  /**
   * @description copy file from path
   * @param oriPath:origin path
   * @returns desPath: target path
   * */
  copyFileFromOriginPath(context: common.UIAbilityContext, oriPath: string, fileName?: string): string {
    let dir = this.getCacheFile(context, 'share_cache');
    if (!fs.accessSync(dir)) {
      fs.mkdirSync(dir);
    }
    let suffix = this.getUrlSuffix(oriPath);
    let name = fileName ? fileName : new Date().getTime().toString();
    let path = dir + '/' + name + suffix;
    this.copyUriFromUrl(path, oriPath);
    return fileUri.getUriFromPath(path);
  }
  /**
   * stream式读取
   */
  readStream(path: string): string {
    try {
      let stat = fs.statSync(path)
      let length = stat.size
      let buf = new ArrayBuffer(length);
      let ss = fs.createStreamSync(path, "r+");
      ss.readSync(buf)
      ss.closeSync();
      let u8: Uint8Array = new Uint8Array(buf);
      let array: Array<number> = Array.from(u8)
      return String.fromCharCode(...array)
    } catch (e) {
      Logger.error("FileUtils - readFilePic " + e)
      return ""
    }
  }

  /**
   * stream式写入
   */
  writeStream(path: string, tempArray: ArrayBuffer) {
    try {
      Logger.info("FileUtils - writeStream =1 ")
      this.createFile(path)
      Logger.info("FileUtils - writeStream 2 ")
      let ss = fs.createStreamSync(path, "r+");
      Logger.info("FileUtils - writeStream 3 " + tempArray.byteLength)
      let num = ss.writeSync(tempArray, {
        encoding: 'utf-8'
      });
      Logger.error("FileUtils - write num = " + num)
      ss.flushSync();
      ss.closeSync();
    } catch (e) {
      Logger.error("FileUtils - Failed to writeStream for " + e)
    }
  }

  /**
   * 创建文件夹
   * @param 文件夹绝对路径
   */
  createFolder(path: string) {
    if (!this.existFolder(path)) {
      fs.mkdirSync(path)
    }
  }

  /**
   * 判断文件夹是否存在
   * @param 文件夹绝对路径
   */
  existFolder(path: string): boolean {
    try {
      let stat = fs.statSync(path)
      return stat.isDirectory()
    } catch (e) {
      Logger.error("fileutils folder exsit error=" + e)
      return false
    }
  }

  /**
   * 如果文件夹不存在则创建一个文件夹 然后在其中创建文件 并且将数据写入进文件
   * @param folder 文件夹绝对路径
   * @param file 文件绝对路径
   * @param content 文件内容数据
   */
  createFileProcess(folder: string, file: string, content: ArrayBuffer | string) {

    // 创建文件夹
    this.createFolder(folder);

    // 创建文件
    this.createFile(file);

    // 写入数据
    this.writeFile(file, content)
  }

  /**
   * string 转 Uint8Array
   * @param str 输入String
   */
  stringToUint8Array(str: string): Uint8Array {
    let arr: Array<number> = new Array<number>();
    for (let i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
    let tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
  }

  uint8ArrayToBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
  }
  bufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
    let uint8Array: Uint8Array = new Uint8Array(buffer)
    return uint8Array;
  }
  writeTestBase64(context: common.UIAbilityContext) {
    try {
      let that = new util.Base64Helper();
      let base64 = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAB9SR//fUkf/31JH/99SR//fUkf/31JH/99SR//fUkf/31JH/99SR//fUkf/6mHbP+LXDf/fUkf/31JH/99SR//fUkf/31JH/99SR//fUkf/31JH/99SR//i104/5lwT/+RZkP/fksh/6eFaP/8/Pv/mG9N/31JH/99SR//fUkf/31JH/99SR//fUkf/31JH/+tjHL/6uHb//7+/v////////////Xx7v/8+/r//////6N/Yv99SR//fUkf/31JH/99SR//fUkf/35LIf/PvK3///////////////////////////////////////////+vj3b/fUkf/31JH/99SR//fUkf/31JH/++pI/////////////08Oz/vqSQ/8y3p///////////////////////u6CK/31JH/99SR//fUkf/31JH/+IWDL/+vn3///////s5d//iVo1/6B7XP/6+ff/8Orl/9TDtv+5nYb/nXZX/4NRKf9+SyL/fUkf/31JH/99SR//sJF3////////////onxe/35LIv+ge1z/ils1/31JH/99SR//fUkf/6qIbf/dz8T/1MK0/31JH/99SR//fUkf/8WunP///////Pv7/39MIv99SR//fUkf/31JH/99SR//fUkf/31JH//ay7///////+ri2/99SR//fUkf/31JH//Frpv///////38+/9/TCP/fUkf/31JH/99SR//fUkf/31JH/99SR//2szA///////q4dv/fUkf/31JH/99SR//r491////////////pIBi/31JH/99SR//fUkf/31JH/99SR//hVUt//j29P//////1MK1/31JH/99SR//fUkf/4dXMP/59/b//////+7o4/+MXjn/fUkf/31JH/99SR//gE0k/9XFuP///////////6aDZ/99SR//fUkf/31JH/99SR//up+I////////////9vPw/8OrmP+si3D/uZ2G/+ri2////////////97Rx/99SiD/fUkf/31JH/99SR//fUkf/31KIP/KtqX//v7+/////////////////////////////////+Xb0/+HWDH/fUkf/31JH/99SR//fUkf/31JH/99SR//fUkf/6eFaP/l2tL//v7+////////////8evn/7yhi/+BTyb/fUkf/31JH/99SR//fUkf/31JH/99SR//fUkf/31JH/99SR//fUkf/4dXMP+Uakf/jV86/31JH/99SR//fUkf/31JH/99SR//fUkf/31JH/9/SyH/f0sh/39LIf9/SyH/f0sh/39LIf9/SyH/f0sh/39LIf9/SyH/f0sh/39LIf9/SyH/f0sh/39LIf9/SyH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
      let result: Uint8Array = that.decodeSync(base64, util.Type.MIME);
      let buf: ArrayBuffer = result.buffer as ArrayBuffer
      const path1: string = context.filesDir + "/pixel_map1168.png";
      let fd = fs.openSync(path1, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd;
      fs.writeSync(fd, buf);
      fs.closeSync(fd);
      return fileUri.getUriFromPath(path1)
    } catch (err) {
      Logger.error(`Failed to write base64, err.code = ${err.code}, err.message = ${err.message}`);
    }
  }

  writeTestText(context: common.UIAbilityContext): string {
    let c = context;
    let filesDir = c.filesDir;
    // 新建并打开文件
    let fd = fs.openSync(filesDir + '/test.txt', fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE).fd;
    Logger.info("canPreview:  创建" + filesDir);
    // 写入一段内容至文件
    let writeLen = fs.writeSync(fd, "Try to write str.");
    Logger.info("The length of str is: " + writeLen);
    // 从文件读取一段内容
    let arrayBuffer = new ArrayBuffer(1024);
    let readOptions: ReadOptions = {
      offset: 0,
      length: arrayBuffer.byteLength
    };
    let readLen = fs.readSync(fd, arrayBuffer, readOptions);
    let buf = buffer.from(arrayBuffer, 0, readLen);
    Logger.info("the content of file: " + buf.toString());
    // 关闭文件
    fs.closeSync(fd);
    return fileUri.getUriFromPath(filesDir + '/test.txt')
  }
  async testUrls(context: common.UIAbilityContext): Promise<string[]> {
    let path0 = this.writeTestText(context);
    let path1 = FileUtils.getInstance().writeTestBase64(context);
    let path2 = await FileUtils.getInstance().saveSourceImageFile(context, 'a1.png', 'aaa');
    let path3 = await FileUtils.getInstance().saveSourceVideoFile(context, 'e1.mp4', 'eeee');
    return [path0, path1, path2, path3];
  }
}

