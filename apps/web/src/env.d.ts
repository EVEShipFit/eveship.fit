interface ImportMetaEnv {
  /** The version in package.json, which a release sets. */
  readonly EVESHIPFIT_VERSION: string;
  /** The client ID of EVE's login; without it, there is no login. */
  readonly VITE_ESI_CLIENT_ID?: string;
}
