interface ImportMetaEnv {
  /** The version of the build: the release tag, `git describe`, or the one in package.json. */
  readonly EVESHIPFIT_VERSION: string;
  /** The version of `@eveshipfit/sde`. */
  readonly EVESHIPFIT_SDE_VERSION: string;
  /** The version of `@eveshipfit/images`. */
  readonly EVESHIPFIT_IMAGES_VERSION: string;
  /** The client ID of EVE's login; without it, there is no login. */
  readonly VITE_ESI_CLIENT_ID?: string;
  /** "true" shows the preview banner. */
  readonly VITE_PREVIEW?: string;
}
