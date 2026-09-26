import { useImages } from "../../images";
import styles from "./Icon.module.css";

/** Each icon's texture, by its path below res:/ui/texture/. */
const textures = {
  "hardpoint-turret": "classes/fitting/iconturrethardpoint",
  "hardpoint-launcher": "classes/fitting/iconlauncherhardpoint",
  // As EVE's fitting window draws them: the 32 pixel versions for high and medium, and for low the larger one,
  // with its wide empty border.
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

/** One of EVE's own interface icons. It is decorative; say what it means next to it. */
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
