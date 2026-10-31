import { formatNumber, useSde, useTypeBonuses } from "@eveshipfit/react-hooks";
import type { Sde, SdeTypeBonus } from "@eveshipfit/sde-loader";
import { Fragment, type ReactNode } from "react";

import styles from "./ShipBonuses.module.css";

const ATTACHED_UNITS = new Set(["%", "+", "x"]);
const TAG = /<(\/?)([abiu])\b[^>]*>/g;

/** What EVE shows when hovering a ship: its name and its bonuses. */
export function ShipBonuses({ typeId }: { typeId: number }) {
  const sde = useSde();
  const bonuses = useTypeBonuses(typeId);

  const sections = [
    ...(bonuses?.skills ?? []).map((skill) => ({
      title: `${sde.type(skill.skillTypeId)?.name ?? "Unknown"} bonuses (per skill level):`,
      bonuses: skill.bonuses,
    })),
    { title: "Role Bonus:", bonuses: bonuses?.role ?? [] },
    { title: "Misc bonus:", bonuses: bonuses?.misc ?? [] },
  ].filter((section) => section.bonuses.length > 0);

  return (
    <span className={styles.bonuses}>
      <span className={styles.name}>{sde.type(typeId)?.name}</span>
      {sections.map((section) => (
        <Fragment key={section.title}>
          <span className={styles.header}>{section.title}</span>
          {section.bonuses.map((bonus, index) => (
            <Fragment key={index}>
              <span className={styles.value}>{formatBonus(sde, bonus)}</span>
              <span>{markup(bonus.text)}</span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </span>
  );
}

function formatBonus(sde: Sde, bonus: SdeTypeBonus): string {
  if (bonus.bonus === undefined) return "·";
  const value = formatNumber(bonus.bonus);
  const unit = sde.unit(bonus.unitId)?.displayName;
  if (unit === undefined) return value;
  return ATTACHED_UNITS.has(unit) ? `${value}${unit}` : `${value} ${unit}`;
}

/** EVE's markup as React; tags may close out of order, as EVE's own text does. */
function markup(text: string): ReactNode[] {
  const open = { a: 0, b: 0, i: 0, u: 0 };
  const nodes: ReactNode[] = [];
  let last = 0;

  const push = (part: string) => {
    if (part === "") return;
    const bold = open.a + open.b > 0;
    const italic = open.i > 0;
    const underline = open.u > 0;
    if (!bold && !italic && !underline) {
      nodes.push(part);
      return;
    }
    nodes.push(
      <span
        key={nodes.length}
        data-bold={bold || undefined}
        data-italic={italic || undefined}
        data-underline={underline || undefined}
      >
        {part}
      </span>,
    );
  };

  for (const match of text.matchAll(TAG)) {
    push(text.slice(last, match.index));
    const tag = match[2] as keyof typeof open;
    open[tag] = Math.max(0, open[tag] + (match[1] === "/" ? -1 : 1));
    last = match.index + match[0].length;
  }
  push(text.slice(last));
  return nodes;
}
