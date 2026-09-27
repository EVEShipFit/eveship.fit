import { loadImages, type Images } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";

let images: Promise<Images> | undefined;

export function loadAllImages(): Promise<Images> {
  // main.ts serves the images at /images/.
  images ??= loadImages({ url: imagesUrl }, { baseUrl: "/images/" });
  return images;
}
