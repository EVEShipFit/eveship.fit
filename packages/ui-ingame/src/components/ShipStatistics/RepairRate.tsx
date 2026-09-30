import { useAttribute } from "@eveshipfit/react-hooks";
import { useId, useRef, useState, type CSSProperties } from "react";

import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { AttributeText } from "./AttributeText";
import styles from "./ShipStatistics.module.css";
import { unit } from "./units";

interface Rate {
  attribute: string;
  icon: IconName;
  label: string;
}

const rates: readonly Rate[] = [
  { attribute: "armorRepairRate", icon: "stat-armor-repair-rate", label: "Armor repair rate" },
  { attribute: "hullRepairRate", icon: "stat-hull-repair-rate", label: "Hull repair rate" },
  { attribute: "passiveShieldRechargeRate", icon: "stat-passive-shield-recharge", label: "Passive shield recharge" },
  { attribute: "shieldBoostRate", icon: "stat-shield-boost-rate", label: "Shield boost rate" },
];

/** One of the ways the fit gets its hitpoints back; click it to pick another. */
export function RepairRate() {
  // Passive shield recharge, as every ship has that.
  const [shown, setShown] = useState(rates[2]!);
  const rate = useAttribute(shown.attribute, { decimals: 0, rounding: "down", format: unit(" hp/s") });
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const noModule = !rate.value;

  return (
    <div
      className={styles.repairRate}
      style={{ "--repair-rate-anchor": `--repair-rate-${menuId.replace(/[^\w-]/g, "")}` } as CSSProperties}
    >
      <button
        type="button"
        className={styles.picker}
        aria-label={`${shown.label}: ${noModule ? "No Module" : rate.text}`}
        popoverTarget={menuId}
      >
        <Icon name="arrow-up" />
        <Icon name={shown.icon} />
        {noModule ? "No Module" : <AttributeText value={rate} />}
      </button>
      <div ref={menu} id={menuId} className={styles.menu} popover="auto">
        {rates.map((option) => (
          <button
            key={option.attribute}
            type="button"
            aria-pressed={option === shown}
            onClick={() => {
              setShown(option);
              menu.current?.hidePopover();
            }}
          >
            <Icon name={option.icon} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
