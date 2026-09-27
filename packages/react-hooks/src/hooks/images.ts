import type { Images } from "@eveshipfit/images";

import { ImagesContext, useRequiredContext } from "../context.js";

export function useImages(): Images {
  return useRequiredContext(ImagesContext, "ImagesProvider");
}
