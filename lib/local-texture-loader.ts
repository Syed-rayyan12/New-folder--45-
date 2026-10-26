import { Texture, TextureLoader } from 'three'

/** Retry an optimized Earth map with the original local asset if loading fails. */
export class LocalTextureLoader extends TextureLoader {
  override load(
    url: string,
    onLoad?: (texture: Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): Texture<HTMLImageElement> {
    const fallback = /^\/vendor\/ghostcat-earth\/earth-(2048|4096)\.(jpg|webp)$/.test(url)
      ? '/vendor/ghostcat-earth/earth.jpg'
      : /^\/images\/galaxy-backgrounds\/galaxy-\d{2}(-mobile)?\.jpg$/.test(url)
        ? '/images/cinematic-milky-way.webp'
        : null
    return super.load(url, onLoad, onProgress, (error) => {
      if (fallback) super.load(fallback, onLoad, onProgress, onError)
      else onError?.(error)
    })
  }
}
