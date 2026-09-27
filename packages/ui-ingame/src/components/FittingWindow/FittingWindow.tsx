import {
  useAttribute,
  useBayUsage,
  useFit,
  useFitHistory,
  useImages,
  useType,
  useViolations,
} from "@eveshipfit/react-hooks";
import { useId, useState, type CSSProperties, type ReactNode } from "react";

import { HistoryBar } from "../../primitives/HistoryBar/HistoryBar";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { FittingWheel } from "../FittingWheel/FittingWheel";
import styles from "./FittingWindow.module.css";
import { countViolations, type ViolationKind } from "./violations";

const oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export interface FittingWindowProps {
  label?: string;
  /** Like `ShipStatistics`; slid out by the Statistics button, which is only there with it. */
  statistics?: ReactNode;
}

/** EVE's fitting window around the `FittingWheel`. */
export function FittingWindow({ label = "Fitting Window", statistics }: FittingWindowProps) {
  const [statisticsOpen, setStatisticsOpen] = useState(true);
  const statisticsId = useId();
  const open = statistics !== undefined && statisticsOpen;

  return (
    <section className={styles.window} aria-label={label} data-statistics={open || undefined}>
      <div className={styles.frame}>
        <div className={styles.wheel}>
          <FittingWheel />
        </div>
        <FitName />
        <Violations />
        <div className={styles.tools}>
          <NotImplementedButton className={styles.tool} icon="hardware" label="Item Browser" />
        </div>
        {statistics !== undefined && (
          <div className={styles.panels}>
            <Tooltip label="Statistics">
              <button
                type="button"
                className={styles.tool}
                aria-label="Statistics"
                aria-expanded={open}
                aria-controls={statisticsId}
                onClick={() => setStatisticsOpen(!open)}
              >
                <Icon name="statistics" />
              </button>
            </Tooltip>
          </div>
        )}
        <div className={styles.bays}>
          <Bay bay="cargo" icon="cargo" label="Cargo Hold" />
          <Bay bay="droneBay" icon="drone-bay" label="Drone Bay" />
        </div>
        <div className={styles.history}>
          <SimulationHistory />
        </div>
        <div className={styles.resources}>
          <Resource title="CPU" load="cpuLoad" output="cpuOutput" />
          <Resource title="Power Grid" load="powerLoad" output="powerOutput" />
        </div>
      </div>
      {statistics !== undefined && (
        <div id={statisticsId} className={styles.statistics} inert={!open}>
          <div className={styles.slide}>{statistics}</div>
        </div>
      )}
    </section>
  );
}

function FitName() {
  const fit = useFit();
  const ship = useType(fit.ship.type_id);

  return (
    <div className={styles.name}>
      <NotImplementedButton className={styles.icon} icon="module-info" label="Show Info" />
      <NotImplementedButton className={styles.icon} icon="link" label="Link Fit" />
      <span className={styles.fitName}>{fit.name || ship?.name}</span>
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
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An <img> cannot be tinted.
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

function NotImplementedButton({ className, icon, label }: { className?: string; icon: IconName; label: string }) {
  return (
    <Tooltip label={`${label} (not implemented yet)`}>
      <button type="button" className={className} aria-label={label} aria-disabled>
        <Icon name={icon} />
      </button>
    </Tooltip>
  );
}

function Bay({ bay, icon, label }: { bay: "cargo" | "droneBay"; icon: IconName; label: string }) {
  const { used, total } = useBayUsage(bay);

  return (
    <Tooltip label={label}>
      <div
        className={styles.bay}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
        role="group"
        aria-label={label}
        data-over={used > total || undefined}
      >
        <Icon name={icon} />
        <span className={styles.used}>{oneDecimal.format(used)}</span>
        <span className={styles.slash}>/</span>
        <span className={styles.total}>{oneDecimal.format(total)}</span>
        <span className={styles.unit}>m3</span>
      </div>
    </Tooltip>
  );
}

function Resource({ title, load, output }: { title: string; load: string; output: string }) {
  // A load nothing adds to is missing.
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

function SimulationHistory() {
  const history = useFitHistory();
  return (
    <HistoryBar label="Simulation History" length={history.length} position={history.position} onGoTo={history.goTo} />
  );
}
