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
  useRackUsage,
  useSde,
  useShownSnapshot,
  useSlots,
  useSnapshot,
  useType,
  type SlotContent,
} from "@eveshipfit/react-hooks";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";

import { HistoryBar } from "../../primitives/HistoryBar/HistoryBar";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { ServiceSlot } from "../../primitives/ServiceSlot/ServiceSlot";
import { Tooltip, TooltipText } from "../../primitives/Tooltip/Tooltip";
import { useFittingSlot } from "../FittingWheel/fittingSlot";
import { FittingWheel } from "../FittingWheel/FittingWheel";
import { AttributeTooltip } from "../ShipStatistics/AttributeTooltip";
import { BayContents, type Bay as BayName } from "./BayContents";
import styles from "./FittingWindow.module.css";
import { ManageFightersContext } from "./manageFighters";
import {
  countViolations,
  missingSkills,
  violationKind,
  violationText,
  type Names,
  type ViolationKind,
} from "./violations";

const oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** EVE draws eight, those the structure does not have as a faint outline. */
const SERVICE_SLOTS = 8;

export interface FittingWindowProps {
  label?: string;
  /** Like `ItemBrowser`; slid out by the Item Browser button, which is only there with it. */
  browser?: ReactNode;
  /** Like `ShipStatistics`; slid out by the Statistics button, which is only there with it. */
  statistics?: ReactNode;
  /** Shows the fit without its name, warnings, history or anything to change it. */
  preview?: boolean;
}

/** EVE's fitting window around the `FittingWheel`. */
export function FittingWindow({ label = "Fitting Window", browser, statistics, preview = false }: FittingWindowProps) {
  const [browserOpen, setBrowserOpen] = useState(true);
  const [statisticsOpen, setStatisticsOpen] = useState(true);
  const browserId = useId();
  const statisticsId = useId();
  const browserShown = browser !== undefined && browserOpen;
  const statisticsShown = statistics !== undefined && statisticsOpen;
  const { stats } = useSnapshot();
  const { structure } = stats;
  const fighters = structure || stats.fighterBay.total > 0;
  const fighterBay = useId();

  return (
    <ManageFightersContext value={fighters && !preview ? () => popover(fighterBay)?.showPopover() : undefined}>
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
            <FittingWheel readOnly={preview} />
          </div>
          {!preview && (
            <>
              <FitName />
              <Violations />
            </>
          )}
          {!preview && browser !== undefined && (
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
          {!preview && statistics !== undefined && (
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
            {structure ? (
              <Bay bay="cargo" icon="ammo-hold" label="Ammo Hold" unlimited readOnly={preview} />
            ) : (
              <Bay bay="cargo" icon="cargo" label="Cargo Hold" readOnly={preview} />
            )}
            {fighters ? (
              <Bay id={fighterBay} bay="fighterBay" icon="fighter-bay" label="Fighter Bay" readOnly={preview} />
            ) : (
              <Bay bay="droneBay" icon="drone-bay" label="Drone Bay" readOnly={preview} />
            )}
          </div>
          {structure && <ServiceRack readOnly={preview} />}
          {!preview && (
            <div className={styles.history}>
              <SimulationHistory tooltipTitle={structure} />
            </div>
          )}
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
    </ManageFightersContext>
  );
}

function popover(id: string): HTMLElement | null {
  const element = document.getElementById(id);
  return element?.matches(":popover-open") ? null : element;
}

function FitName() {
  const fit = useFit();
  const store = useFitStore();
  const ship = useType(fit.ship.type_id);
  const [editing, setEditing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);

  useEffect(() => {
    if (editing) input.current?.focus();
    else if (refocus.current) button.current?.focus();
    refocus.current = false;
  }, [editing]);

  const rename = (name: string) => {
    setEditing(false);
    if (name.trim() !== (fit.name ?? "")) store.setName(name.trim());
  };

  return (
    <div className={styles.name}>
      <NotImplementedButton className={styles.icon} icon="module-info" label="Show Info" />
      <NotImplementedButton className={styles.icon} icon="link" label="Link Fit" />
      {editing ? (
        <input
          className={styles.fitNameInput}
          aria-label="Fit Name"
          defaultValue={fit.name}
          placeholder={ship?.name}
          ref={input}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => rename(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.value = fit.name ?? "";
            if (event.key !== "Enter" && event.key !== "Escape") return;
            event.preventDefault();
            refocus.current = true;
            event.currentTarget.blur();
          }}
        />
      ) : (
        <Tooltip label="Rename Fit">
          <button ref={button} type="button" className={styles.fitName} onClick={() => setEditing(true)}>
            {fit.name || ship?.name}
          </button>
        </Tooltip>
      )}
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

interface BayProps {
  bay: BayName;
  icon: IconName;
  label: string;
  unlimited?: boolean;
  id?: string;
  readOnly?: boolean;
}

function Bay({ bay, icon, label, unlimited = false, id: givenId, readOnly = false }: BayProps) {
  const { used, total } = useBayUsage(bay);
  const ownId = useId();
  const id = givenId ?? ownId;
  const drop = useBayDrop(bay, () => popover(id)?.showPopover());
  const over = (!unlimited && used > total) || undefined;

  if (readOnly) {
    return (
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
      <div className={styles.bay} role="group" aria-label={label} data-over={over}>
        <BayUsage icon={icon} used={used} total={total} />
      </div>
    );
  }

  return (
    <div className={styles.bayAnchor} style={{ "--bay-anchor": `--bay-${id.replace(/[^\w-]/g, "")}` } as CSSProperties}>
      <Tooltip label={label}>
        <BayButton
          icon={icon}
          used={used}
          total={total}
          aria-label={label}
          popoverTarget={id}
          data-over={over}
          {...drop}
        />
      </Tooltip>
      <BayContents id={id} bay={bay} label={label} />
    </div>
  );
}

interface BayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  used: number;
  total: number;
}

function BayButton({ icon, used, total, ...props }: BayButtonProps) {
  return (
    <button type="button" className={styles.bay} {...props}>
      <BayUsage icon={icon} used={used} total={total} />
    </button>
  );
}

function BayUsage({ icon, used, total }: { icon: IconName; used: number; total: number }) {
  return (
    <>
      <Icon name={icon} />
      <span className={styles.used}>{oneDecimal.format(used)}</span>
      <span className={styles.slash}>/</span>
      <span className={styles.total}>{oneDecimal.format(total)}</span>
      <span className={styles.unit}>m3</span>
    </>
  );
}

const baySlots: Record<BayName, Slot> = {
  cargo: { type: "cargo" },
  droneBay: { type: "drone_bay" },
  fighterBay: { type: "fighter_bay" },
};

/**
 * Puts a type dragged onto a bay in it: anything in the cargo, drones in the
 * drone bay, fighters in the fighter bay; `open` shows the fighter tubes to drop on.
 */
function useBayDrop(bay: BayName, open: () => void) {
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
    (bay === "cargo" ? placement(type) !== undefined : placement(type)?.type === slot.type && canFit(type));
  const taken = takes ? type : undefined;

  const target = `bay-${bay}`;

  return {
    onDragEnter: () => {
      if (!taken) return;
      show((draft) => void draft.fit(taken.id, slot), target);
      if (bay === "fighterBay") open();
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

function ServiceRack({ readOnly }: { readOnly: boolean }) {
  const slots = useSlots("service");
  const { total } = useRackUsage("service");

  return (
    <div
      className={styles.services}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
      role="group"
      aria-label="Structure Services"
    >
      {Array.from({ length: SERVICE_SLOTS }, (_, index) => (
        <FittingServiceSlot
          key={index}
          index={index}
          available={index < total}
          content={slots[index]}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

function FittingServiceSlot({
  index,
  available,
  content,
  readOnly,
}: {
  index: number;
  available: boolean;
  content: SlotContent | undefined;
  readOnly: boolean;
}) {
  const { chargeTypeId, chargeable, activatable, onRemoveCharge, tooltip, ...slot } = useFittingSlot(
    "service",
    index,
    content,
    available,
    readOnly,
  );
  return <ServiceSlot {...slot} />;
}

function SimulationHistory({ tooltipTitle }: { tooltipTitle: boolean }) {
  const history = useFitHistory();
  return (
    <HistoryBar
      label="Simulation History"
      length={history.length}
      position={history.position}
      onGoTo={history.goTo}
      tooltipTitle={tooltipTitle}
    />
  );
}
