import type { Images } from "@eveshipfit/images";
import type { ReactNode } from "react";

import { ImagesContext } from "./context.js";

export interface ImagesProviderProps {
  /** From `loadImages` of `@eveshipfit/images`. */
  images: Images;
  children?: ReactNode;
}

export function ImagesProvider({ images, children }: ImagesProviderProps) {
  return <ImagesContext value={images}>{children}</ImagesContext>;
}
