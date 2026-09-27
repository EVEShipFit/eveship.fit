export type SensorRace = "amarr" | "caldari" | "gallente" | "minmatar";

export const sensorAttributes = {
  amarr: "scanRadarStrength",
  caldari: "scanGravimetricStrength",
  gallente: "scanMagnetometricStrength",
  minmatar: "scanLadarStrength",
} as const satisfies Record<SensorRace, string>;

const races = Object.keys(sensorAttributes) as SensorRace[];

/** EVE shows the strongest; the first of a tie. */
export function strongestSensor(strengths: Record<SensorRace, { value: number | undefined }>): SensorRace {
  return races.reduce((best, race) => ((strengths[race].value ?? 0) > (strengths[best].value ?? 0) ? race : best));
}
