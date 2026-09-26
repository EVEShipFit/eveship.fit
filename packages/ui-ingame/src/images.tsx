import type { Images } from "@eveshipfit/images";
import { createContext, useContext, type ReactNode } from "react";

const ImagesContext = createContext<Images | undefined>(undefined);

export interface ImagesProviderProps {
  /** From `loadImages` of `@eveshipfit/images`, with its images served at the `baseUrl` given there. */
  images: Images;
  children?: ReactNode;
}

/** Gives icons the images to draw with. */
export function ImagesProvider({ images, children }: ImagesProviderProps) {
  return <ImagesContext value={images}>{children}</ImagesContext>;
}

export function useImages(): Images {
  const images = useContext(ImagesContext);
  if (images === undefined) throw new Error("Icons need to be inside an <ImagesProvider>");
  return images;
}
