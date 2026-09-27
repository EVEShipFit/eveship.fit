import { useImages } from "@eveshipfit/react-hooks";

import styles from "./Icon.module.css";

const textures = {
  "hardpoint-turret": "classes/fitting/iconturrethardpoint",
  "hardpoint-launcher": "classes/fitting/iconlauncherhardpoint",
  "slot-high": "classes/fitting/filtericonhighslot_32",
  "slot-medium": "classes/fitting/filtericonmediumslot_32",
  "slot-low": "classes/fitting/filtericonlowslot",
  "slot-rig": "classes/fitting/filtericonrigslot",
  "slot-subsystem": "windowicons/subsystems",
} satisfies Record<string, string>;

export type IconName = keyof typeof textures;

export const iconNames = Object.keys(textures) as IconName[];

export interface IconProps {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16 }: IconProps) {
  const images = useImages();

  return (
    <img
      className={styles.icon}
      src={images.uiTexture(textures[name])}
      width={size}
      height={size}
      alt=""
      data-icon={name}
      draggable={false}
    />
  );
}
