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
import { BayContents } from "./BayContents";
import styles from "./FittingWindow.module.css";
import { countViolations, type ViolationKind } from "./violations";

const oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export interface FittingWindowProps {
  label?: string;
  /** Like `ItemBrowser`; slid out by the Item Browser button, which is only there with it. */
  browser?: ReactNode;
  /** Like `ShipStatistics`; slid out by the Statistics button, which is only there with it. */
  statistics?: ReactNode;
}

/** EVE's fitting window around the `FittingWheel`. */
export function FittingWindow({ label = "Fitting Window", browser, statistics }: FittingWindowProps) {
  const [browserOpen, setBrowserOpen] = useState(true);
  const [statisticsOpen, setStatisticsOpen] = useState(true);
  const browserId = useId();
  const statisticsId = useId();
  const browserShown = browser !== undefined && browserOpen;
  const statisticsShown = statistics !== undefined && statisticsOpen;

  return (
    <section
      className={styles.window}
      aria-label={label}
      data-browser={browserShown || undefined}
      data-statistics={statisticsShown || undefined}
    >
      {browser !== undefined && (
        <div id={browserId} className={styles.browser} inert={!browserShown}>
          <div className={styles.slide}>{browser}</div>
        </div>
      )}
      <div className={styles.frame}>
        <div className={styles.wheel}>
          <FittingWheel />
        </div>
        <FitName />
        <Violations />
        {browser !== undefined && (
          <div className={styles.tools}>
            <Tooltip label="Item Browser">
              <button
                type="button"
                className={styles.tool}
                aria-label="Item Browser"
                aria-expanded={browserShown}
                aria-controls={browserId}
                onClick={() => setBrowserOpen(!browserShown)}
              >
                <Icon name="hardware" />
              </button>
            </Tooltip>
          </div>
        )}
        {statistics !== undefined && (
          <div className={styles.panels}>
            <Tooltip label="Statistics">
              <button
                type="button"
                className={styles.tool}
                aria-label="Statistics"
                aria-expanded={statisticsShown}
                aria-controls={statisticsId}
                onClick={() => setStatisticsOpen(!statisticsShown)}
              >
                <Icon name="statistics" />
              </button>
            </Tooltip>
          </div>
        )}
        <div className={styles.bays}>
          <Bay bay="cargo" icon="cargo" label="Cargo Hold" listed />
          <Bay bay="droneBay" icon="drone-bay" label="Drone Bay" />
        </div>
        <div className={styles.history}>
          <SimulationHistory />
        </div>
        <div className={styles.resources}>
          <Resource title="CPU" free="cpuFree" output="cpuOutput" />
          <Resource title="Power Grid" free="powerFree" output="powerOutput" />
        </div>
      </div>
      {statistics !== undefined && (
        <div id={statisticsId} className={styles.statistics} inert={!statisticsShown}>
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

function Bay({
  bay,
  icon,
  label,
  listed = false,
}: {
  bay: "cargo" | "droneBay";
  icon: IconName;
  label: string;
  listed?: boolean;
}) {
  const { used, total } = useBayUsage(bay);
  const id = useId();
  const usage = (
    <>
      <Icon name={icon} />
      <span className={styles.used}>{oneDecimal.format(used)}</span>
      <span className={styles.slash}>/</span>
      <span className={styles.total}>{oneDecimal.format(total)}</span>
      <span className={styles.unit}>m3</span>
    </>
  );

  if (!listed) {
    return (
      <Tooltip label={label}>
        <div
          className={styles.bay}
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
          role="group"
          aria-label={label}
          data-over={used > total || undefined}
        >
          {usage}
        </div>
      </Tooltip>
    );
  }

  return (
    <div className={styles.bayAnchor} style={{ "--bay-anchor": `--bay-${id.replace(/[^\w-]/g, "")}` } as CSSProperties}>
      <Tooltip label={label}>
        <button
          type="button"
          className={styles.bay}
          aria-label={label}
          popoverTarget={id}
          data-over={used > total || undefined}
        >
          {usage}
        </button>
      </Tooltip>
      <BayContents id={id} bay={bay} label={label} />
    </div>
  );
}

function Resource({ title, free, output }: { title: string; free: string; output: string }) {
  const left = useAttribute(free);
  const total = useAttribute(output).value ?? 0;
  const value = left.value ?? 0;

  return (
    <div className={styles.resource} data-over={value < 0 || undefined} data-change={left.change}>
      <span className={styles.title}>{title}</span>
      <span>
        <span className={styles.free}>{oneDecimal.format(value)}</span>/{oneDecimal.format(total)}
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
