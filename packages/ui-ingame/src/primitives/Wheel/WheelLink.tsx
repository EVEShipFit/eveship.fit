import { useId } from "react";

import styles from "./WheelLink.module.css";

export interface WheelLinkProps {
  href: string;
  text: string;
}

/** A link written along the top of the wheel's rim. */
export function WheelLink({ href, text }: WheelLinkProps) {
  const arc = useId();

  return (
    <svg className={styles.link} viewBox="-320 -320 640 640">
      <path id={arc} d="M -275 0 A 275 275 0 0 1 275 0" fill="none" />
      <a href={href} target="_blank" rel="noopener" aria-label={text}>
        <text className={styles.text} textAnchor="middle">
          <textPath href={`#${arc}`} startOffset="50%">
            {text}
          </textPath>
        </text>
      </a>
    </svg>
  );
}
