import { useFleet, useSde, type FleetBuff } from "@eveshipfit/react-hooks";

import { Tooltip, TooltipText } from "../../primitives/Tooltip/Tooltip";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./ShipStatistics.module.css";

/** The buffs that landed on the fit, one icon each; empty without any. */
export function BoostsBar() {
  const sde = useSde();
  const { buffs, boosters } = useFleet();
  if (buffs.length === 0) return null;

  const sourceOf = (buff: FleetBuff) => {
    if (buff.booster !== undefined) {
      const fit = boosters[buff.booster]?.fit;
      return fit && (fit.name || sde.type(fit.ship.type_id)?.name);
    }
    return buff.charge === undefined ? undefined : "this fit";
  };

  return (
    <div className={styles.boosts}>
      <span className={styles.boostsLabel}>Boosts</span>
      <ul className={styles.buffs} aria-label="Boosts">
        {buffs.map((buff) => {
          const source = sourceOf(buff);
          const label = [buff.name, buff.effect, source && `from ${source}`].filter(Boolean).join(" ");
          return (
            <li key={buff.id}>
              <Tooltip
                wide
                label={
                  <TooltipText
                    title={source === undefined ? buff.name : `${buff.name} · from ${source}`}
                    description={buff.effect && <span className={styles.buffEffect}>{buff.effect}</span>}
                  />
                }
              >
                {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- The icon is layered images, or a letter. */}
                <span className={styles.buff} role="img" aria-label={label}>
                  {buff.charge === undefined ? (
                    buff.name.charAt(0)
                  ) : (
                    <TypeIcon typeId={buff.charge} size={20} marker={false} />
                  )}
                </span>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
