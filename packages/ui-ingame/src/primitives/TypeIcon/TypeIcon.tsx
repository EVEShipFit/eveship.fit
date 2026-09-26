import styles from "./TypeIcon.module.css";

const imageSizes = [32, 64, 128, 256, 512, 1024];

export interface TypeIconProps {
  typeId: number;
  size?: number;
}

/** The icon of a ship, module or other item, from EVE's image server. */
export function TypeIcon({ typeId, size = 32 }: TypeIconProps) {
  return (
    <img
      className={styles.icon}
      src={iconUrl(typeId, size)}
      srcSet={`${iconUrl(typeId, size * 2)} 2x`}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      draggable={false}
    />
  );
}

function iconUrl(typeId: number, size: number): string {
  const imageSize = imageSizes.find((available) => available >= size) ?? imageSizes.at(-1);
  return `https://images.evetech.net/types/${typeId}/icon?size=${imageSize}`;
}
