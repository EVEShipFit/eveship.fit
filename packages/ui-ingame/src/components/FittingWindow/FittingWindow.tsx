import {
  useAttribute,
  useBayUsage,
  useFit,
  useFitHistory,
  useImages,
  useType,
  useViolations,
} from "@eveshipfit/react-hooks";
import type { CSSProperties } from "react";

import { HistoryBar } from "../../primitives/HistoryBar/HistoryBar";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { FittingWheel } from "../FittingWheel/FittingWheel";
import styles from "./FittingWindow.module.css";
import { countViolations, type ViolationKind } from "./violations";

const oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export interface FittingWindowProps {
  label?: string;
}

/** EVE's fitting window around the `FittingWheel` of the fit in the surrounding `EveShipFitProvider`. */
export function FittingWindow({ label = "Fitting Window" }: FittingWindowProps) {
  return (
    <section className={styles.window} aria-label={label}>
      <div className={styles.wheel}>
        <FittingWheel />
      </div>
      <FitName />
      <Violations />
      <div className={styles.tools}>
        <ToolButton icon="hardware" label="Item Browser" />
      </div>
      <div className={styles.panels}>
        <ToolButton icon="statistics" label="Statistics" />
      </div>
      <div className={styles.bays}>
        <Bay bay="cargo" icon="cargo" label="Cargo Hold" />
        <Bay bay="droneBay" icon="drone-bay" label="Drone Bay" />
      </div>
      <div className={styles.history}>
        <FitHistory />
      </div>
      <div className={styles.resources}>
        <Resource title="CPU" load="cpuLoad" output="cpuOutput" />
        <Resource title="Power Grid" load="powerLoad" output="powerOutput" />
      </div>
    </section>
  );
}

function FitName() {
  const fit = useFit();
  const ship = useType(fit.ship.type_id);

  return (
    <div className={styles.name}>
      <NotImplemented icon="module-info" label="Show Info" />
      <NotImplemented icon="link" label="Link Fit" />
      <span>{fit.name ?? ship?.name}</span>
    </div>
  );
}

const violationKinds: { kind: ViolationKind; label: string }[] = [
  { kind: "error", label: "Fitting Errors" },
  { kind: "skill", label: "Missing Skills" },
  { kind: "notice", label: "Fitting Warnings" },
];

function Violations() {
  const images = useImages();
  const counts = countViolations(useViolations());

  return (
    <div className={styles.violations}>
      {violationKinds.map(({ kind, label }) => {
        const shown = counts[kind];
        if (shown === 0) return null;
        const texture = images.uiTexture(
          kind === "skill" ? "classes/fitting/warningskills" : "classes/fitting/warninggroup",
        );
        return (
          <Tooltip key={kind} label={`${label}: ${shown}`}>
            <span
              className={styles.violation}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An <img> cannot be tinted like EVE tints this texture.
              role="img"
              aria-label={`${label}: ${shown}`}
              data-kind={kind}
              style={{ "--texture": `url(${texture})` } as CSSProperties}
            >
              <span className={styles.count}>{shown}</span>
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
}

function ToolButton({ icon, label }: { icon: IconName; label: string }) {
  return (
    <Tooltip label={`${label} (not implemented yet)`}>
      <button type="button" className={styles.tool} aria-label={label} aria-disabled>
        <Icon name={icon} />
      </button>
    </Tooltip>
  );
}

function NotImplemented({ icon, label }: { icon: IconName; label: string }) {
  return (
    <Tooltip label={`${label} (not implemented yet)`}>
      <button type="button" className={styles.icon} aria-label={label} aria-disabled>
        <Icon name={icon} />
      </button>
    </Tooltip>
  );
}

function Bay({ bay, icon, label }: { bay: "cargo" | "droneBay"; icon: IconName; label: string }) {
  const { used, total } = useBayUsage(bay);

  return (
    <div className={styles.bay} title={label} data-bay={bay} data-over={used > total || undefined}>
      <Icon name={icon} />
      <span className={styles.used}>{oneDecimal.format(used)}</span>
      <span className={styles.slash}>/</span>
      <span className={styles.total}>{oneDecimal.format(total)}</span>
      <span className={styles.unit}>m3</span>
    </div>
  );
}

function Resource({ title, load, output }: { title: string; load: string; output: string }) {
  // Nothing adds to a load the fit does not use, so it is missing.
  const used = useAttribute(load).value ?? 0;
  const total = useAttribute(output).value ?? 0;
  const free = total - used;

  return (
    <div className={styles.resource} data-over={free < 0 || undefined}>
      <span className={styles.title}>{title}</span>
      <span>
        {oneDecimal.format(free)}/{oneDecimal.format(total)}
      </span>
    </div>
  );
}

function FitHistory() {
  const history = useFitHistory();
  return (
    <HistoryBar label="Simulation History" length={history.length} position={history.position} onGoTo={history.goTo} />
  );
}
