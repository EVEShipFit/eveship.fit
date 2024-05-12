import React from "react";
import Image from "next/image";

import styles from "./Banner.module.css";

export const Banner = () => {
  return (
    <>
      <div className={styles.banner}>
        EVEShip.fit - View, Create, and Share your EVE Online ship fits online
        <div className={styles.bannerLinks}>
          <a href="https://github.com/EVEShipFit/#donations" target="_new">
            <Image src="/plex.png" alt="Donation" width={32} height={32} title="Donate to keep eveship.fit running" />
          </a>
          <a href="https://discord.gg/S5V5BkvNf7" target="_new">
            <Image src="/discord.svg" alt="Discord" width={32} height={32} title="Join us on Discord!" />
          </a>
          <a href="https://github.com/EVEShipFit" target="_new">
            <Image
              src="/github-mark-white.svg"
              alt="GitHub"
              width={32}
              height={32}
              title="View source-code on GitHub"
            />
          </a>
        </div>
      </div>
    </>
  );
};
