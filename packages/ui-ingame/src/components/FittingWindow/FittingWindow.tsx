import type { Slot } from "@eveshipfit/fitting";
import {
  useAttribute,
  useBayUsage,
  useCanFit,
  useDrag,
  useFit,
  useFitHistory,
  useFitStore,
  useImages,
  usePlacement,
  usePreview,
  useSde,
  useShownSnapshot,
  useType,
} from "@eveshipfit/react-hooks";
import { useId, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";

import { HistoryBar } from "../../primitives/HistoryBar/HistoryBar";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip, TooltipText } from "../../primitives/Tooltip/Tooltip";
import { FittingWheel } from "../FittingWheel/FittingWheel";
import { AttributeTooltip } from "../ShipStatistics/AttributeTooltip";
import { BayContents } from "./BayContents";
import styles from "./FittingWindow.module.css";
import {
  countViolations,
  missingSkills,
  violationKind,
  violationText,
  type Names,
  type ViolationKind,
} from "./violations";

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
          <Bay bay="cargo" icon="cargo" label="Cargo Hold" />
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

const violationKinds: { kind: ViolationKind; label: string; title: string }[] = [
  { kind: "error", label: "Fitting Errors", title: "Fitting Alert" },
  { kind: "skill", label: "Missing Skills", title: "Missing Skills" },
  { kind: "notice", label: "Fitting Warnings", title: "Fitting Warning" },
];

function Violations() {
  const images = useImages();
  const sde = useSde();
  const { fit, stats } = useShownSnapshot();
  const counts = countViolations(stats.violations);
  const descriptionId = useId();
  const names: Names = {
    type: (id) => sde.type(id)?.name ?? `#${id}`,
    group: (id) => sde.group(id)?.name ?? `#${id}`,
  };

  const linesOf = (kind: ViolationKind) => {
    const violations =
      kind === "skill"
        ? missingSkills(stats.violations).map((rule) => ({ target: { type: "ship" } as const, rule }))
        : stats.violations.filter(({ rule }) => violationKind(rule) === kind);
    return [...new Set(violations.map((violation) => violationText(violation, fit, names)))];
  };

  return (
    <div className={styles.violations}>
      {violationKinds.map(({ kind, label, title }) => {
        const shown = counts[kind];
        if (shown === 0) return null;
        const lines = linesOf(kind);
        const textureStyle = {
          "--texture": `url(${images.uiTexture(
            kind === "skill" ? "classes/fitting/warningskills" : "classes/fitting/warninggroup",
          )})`,
        } as CSSProperties;
        return (
          <Tooltip
            key={kind}
            label={
              <span className={styles.alert} data-kind={kind} style={textureStyle}>
                <TooltipText
                  title={<span className={styles.alertTitle}>{title}</span>}
                  description={lines.map((line) => (
                    <span key={line} className={styles.alertLine}>
                      {line}
                    </span>
                  ))}
                />
              </span>
            }
          >
            <span
              className={styles.violation}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An <img> cannot be tinted.
              role="img"
              aria-label={`${label}: ${shown}`}
              aria-describedby={`${descriptionId}-${kind}`}
              data-kind={kind}
              style={textureStyle}
            >
              <span className={styles.count}>{shown}</span>
              <span id={`${descriptionId}-${kind}`} hidden>
                {lines.join(", ")}
              </span>
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
  const id = useId();
  const drop = useBayDrop(bay);

  return (
    <div className={styles.bayAnchor} style={{ "--bay-anchor": `--bay-${id.replace(/[^\w-]/g, "")}` } as CSSProperties}>
      <Tooltip label={label}>
        <button
          type="button"
          className={styles.bay}
          aria-label={label}
          popoverTarget={id}
          data-over={used > total || undefined}
          {...drop}
        >
          <Icon name={icon} />
          <span className={styles.used}>{oneDecimal.format(used)}</span>
          <span className={styles.slash}>/</span>
          <span className={styles.total}>{oneDecimal.format(total)}</span>
          <span className={styles.unit}>m3</span>
        </button>
      </Tooltip>
      <BayContents id={id} bay={bay} label={label} />
    </div>
  );
}

const baySlots: Record<"cargo" | "droneBay", Slot> = { cargo: { type: "cargo" }, droneBay: { type: "drone_bay" } };

/** Puts a type dragged onto a bay in it: anything in the cargo, drones in the drone bay. */
function useBayDrop(bay: "cargo" | "droneBay") {
  const store = useFitStore();
  const sde = useSde();
  const placement = usePlacement();
  const canFit = useCanFit();
  const { dragging, end } = useDrag();
  const { show, clear } = usePreview();
  const slot = baySlots[bay];
  const type = dragging?.type === "type" ? sde.type(dragging.typeId) : undefined;
  const takes =
    type !== undefined &&
    (bay === "cargo" ? placement(type) !== undefined : placement(type)?.type === "drone_bay" && canFit(type));
  const taken = takes ? type : undefined;

  const target = `bay-${bay}`;

  return {
    onDragEnter: () => {
      if (taken) show((draft) => void draft.fit(taken.id, slot), target);
    },
    onDragLeave: () => clear(target),
    onDragOver: (event: DragEvent) => {
      if (!taken) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDrop: (event: DragEvent) => {
      if (!taken) return;
      event.preventDefault();
      clear(target);
      store.fit(taken.id, slot);
      end();
    },
  };
}

function Resource({ title, free, output }: { title: string; free: string; output: string }) {
  const left = useAttribute(free);
  const total = useAttribute(output).value ?? 0;
  const value = left.value ?? 0;

  return (
    <Tooltip label={<AttributeTooltip attribute={output} />}>
      <div className={styles.resource} data-over={value < 0 || undefined} data-change={left.change}>
        <span className={styles.title}>{title}</span>
        <span>
          <span className={styles.free}>{oneDecimal.format(value)}</span>/{oneDecimal.format(total)}
        </span>
      </div>
    </Tooltip>
  );
}

function SimulationHistory() {
  const history = useFitHistory();
  return (
    <HistoryBar label="Simulation History" length={history.length} position={history.position} onGoTo={history.goTo} />
  );
}
