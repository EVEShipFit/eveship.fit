export type SensorRace = "amarr" | "caldari" | "gallente" | "minmatar";

export const sensorAttributes = {
  amarr: "scanRadarStrength",
  caldari: "scanGravimetricStrength",
  gallente: "scanMagnetometricStrength",
  minmatar: "scanLadarStrength",
} as const satisfies Record<SensorRace, string>;

const races = Object.keys(sensorAttributes) as SensorRace[];

/** The race whose sensor is strongest, which is the one EVE shows; the first of a tie. */
export function strongestSensor(strengths: Record<SensorRace, number | undefined>): SensorRace {
  return races.reduce((best, race) => ((strengths[race] ?? 0) > (strengths[best] ?? 0) ? race : best));
}
