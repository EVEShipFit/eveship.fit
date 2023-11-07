import React from "react";
import Image from "next/image";

import styles from "./Banner.module.css";

export const Banner = () => {
  return <>
    <div className={styles.banner}>
      EVEShip.fit - View, Create, and Share your EVE Online ship fits online
      <div className={styles.bannerLinks}>
        <a href="https://github.com/EVEShipFit">
          <Image src="/github-mark.svg" alt="GitHub" width={32} height={32} />
        </a>
      </div>
    </div>
    <div className={styles.bannerConstruction}>
      This website is currently a work in progress; not all functionalities are available yet.<br/>
      Found a bug? Please <a href="https://github.com/EVEShipFit/roadmap/issues" >report it here</a>.
    </div>
  </>
}
