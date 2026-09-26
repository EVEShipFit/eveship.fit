import { loadImages, type Images } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";

let images: Promise<Images> | undefined;

/** EVE's icons, loaded once for every story; main.ts serves them at /images/. */
export function loadAllImages(): Promise<Images> {
  images ??= loadImages({ url: imagesUrl }, { baseUrl: "/images/" });
  return images;
}
