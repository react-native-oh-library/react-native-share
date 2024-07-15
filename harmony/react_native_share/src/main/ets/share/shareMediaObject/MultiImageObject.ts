import MediaObject from './MediaObject';

export class MultiImageObject extends MediaObject {
  uriStrs: string[] | null = null;

  getImageUris(): string[] | null {
    return this.uriStrs;
  }
}