import { useImages } from "@eveshipfit/react-hooks";

import styles from "./Icon.module.css";

const textures = {
  "hardpoint-turret": "classes/fitting/iconturrethardpoint",
  "hardpoint-launcher": "classes/fitting/iconlauncherhardpoint",
  "slot-high": "classes/fitting/filtericonhighslot_32",
  "slot-medium": "classes/fitting/filtericonmediumslot_32",
  "slot-low": "classes/fitting/filtericonlowslot",
  "slot-rig": "classes/fitting/filtericonrigslot",
  "slot-subsystem": "windowicons/subsystems",
  "module-unfit": "icons/38_16_200",
  "module-power": "icons/38_16_207",
  "module-info": "icons/38_16_208",
  link: "eveicon/system_icons/link_16px",
  search: "eveicon/system_icons/search_16px",
  collapse: "eveicon/system_icons/collapse_16px",
  checkmark: "eveicon/system_icons/checkmark_16px",
  close: "eveicon/system_icons/close_16px",
  "fits-browser": "windowicons/browser",
  "fits-personal": "windowicons/member",
  "fits-corporation": "windowicons/corporation",
  "fits-alliance": "classes/fitting/taballiancefits",
  "fits-community": "classes/fitting/tabcommunityfits",
  "fits-alliance-small": "classes/fitting/iconalliancesmall",
  "fits-community-small": "classes/fitting/iconcommunityfitssmall",
  "current-hull": "classes/fitting/tabfittings",
  skills: "classes/fitting/filtericonskills",
  simulate: "classes/fitting/iconsimulatortoggle",
  hardware: "classes/fitting/tabhardware",
  statistics: "eveicon/system_icons/list_view_16px",
  cargo: "windowicons/ships",
  "drone-bay": "windowicons/dronebay",
  "arrow-left": "shared/triangleleft",
  "arrow-right": "shared/triangleright",
  "arrow-down": "shared/triangledown",
  "arrow-up": "shared/triangleup",
  price: "eveicon/system_icons/market_details_16px",
  "stat-turret-dps": "classes/fitting/statsicons/turretdps",
  "stat-alpha-strike": "classes/fitting/statsicons/alphastrike",
  "stat-shield-hp": "classes/fitting/statsicons/shieldhp",
  "stat-armor-hp": "classes/fitting/statsicons/armorhp",
  "stat-structure-hp": "classes/fitting/statsicons/structurehp",
  "stat-em-resistance": "classes/fitting/statsicons/emresistance",
  "stat-thermal-resistance": "classes/fitting/statsicons/thermalresistance",
  "stat-kinetic-resistance": "classes/fitting/statsicons/kineticresistance",
  "stat-explosive-resistance": "classes/fitting/statsicons/explosiveresistance",
  "stat-armor-repair-rate": "classes/fitting/statsicons/armorrepairrate",
  "stat-hull-repair-rate": "classes/fitting/statsicons/hullrepairrate",
  "stat-passive-shield-recharge": "classes/fitting/statsicons/passiveshieldrecharge",
  "stat-shield-boost-rate": "classes/fitting/statsicons/shieldboostrate",
  "stat-sensor-amarr": "classes/fitting/statsicons/sensorstrengthamarr",
  "stat-sensor-caldari": "classes/fitting/statsicons/sensorstrengthcaldari",
  "stat-sensor-gallente": "classes/fitting/statsicons/sensorstrengthgallente",
  "stat-sensor-minmatar": "classes/fitting/statsicons/sensorstrengthminmatar",
  "stat-scan-resolution": "classes/fitting/statsicons/scanresolution",
  "stat-signature-radius": "classes/fitting/statsicons/signatureradius",
  "stat-locked-targets": "classes/fitting/statsicons/maximumlockedtargets",
  "stat-mass": "classes/fitting/statsicons/mass",
  "stat-inertia": "classes/fitting/statsicons/inertiamodifier",
  "stat-warp-speed": "classes/fitting/statsicons/warpspeed",
  "stat-align-time": "classes/fitting/statsicons/aligntime",
  "stat-drone-bandwidth": "classes/fitting/statsicons/bandwidth",
  "stat-drone-control-range": "classes/fitting/statsicons/controlrange",
} satisfies Record<string, string>;

export type IconName = keyof typeof textures;

export const iconNames = Object.keys(textures) as IconName[];

export interface IconProps {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16 }: IconProps) {
  const src = useIconUrl(name);

  return <img className={styles.icon} src={src} width={size} height={size} alt="" data-icon={name} draggable={false} />;
}

export function useIconUrl(name: IconName): string | undefined {
  return useImages().uiTexture(textures[name]);
}
