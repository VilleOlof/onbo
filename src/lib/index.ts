import boat_blue from "$lib/assets/boats/boat_blue.png"
import boat_gray from "$lib/assets/boats/boat_gray.png"
import boat_green from "$lib/assets/boats/boat_green.png"
import boat_red from "$lib/assets/boats/boat_red.png"

export const NINJABRAIN_BOT_API = "http://localhost:52533";

export type Stronghold = {
    eyeThrows: EyeThrow[];
    resultType: "NONE" | "TRIANGULATION" | "FAILED" | "BLIND" | "DIVINE" | "ALL_ADVANCEMENTS";
    playerPosition: PlayerPosition;
    predictions: Prediction[]
}

export type EyeThrow = {
    xInOverworld: number;
    zInOverworld: number;
    angle: number;
    angleWithoutCorrection: number;
    correction: number;
    correctionIncrements: number,
    error: number;
    type: "NORMAL" | "NORMAL_WITH_ALT_STD" | "MANUAL" | "BOAT"
}

export type PlayerPosition = {
    xInOverworld: number;
    zInOverworld: number;
    horizontalAngle: number;
    isInOverworld: boolean;
    isInNether: boolean
}

export type Prediction = {
    chunkX: number;
    chunkZ: number;
    certainty: number;
    overworldDistance: number
}

export type BoatState = "NONE" | "ERROR" | "MEASURING" | "VALID"
export const BOAT_MAP: { [key: string]: string } = {
    "NONE": boat_gray,
    "ERROR": boat_red,
    "MEASURING": boat_blue,
    "VALID": boat_green
}

export type Boat = {
    boatAngle?: number;
    boatState: BoatState
}

export type BlindEvaluation = "EXCELLENT" | "HIGHROLL_GOOD" | "HIGHROLL_OKAY" | "BAD_BUT_IN_RING" | "BAD" | "NOT_IN_RING";
export const BLIND_MAP: { [key: string]: string } = {
    "EXCELLENT": "Excellent",
    "HIGHROLL_GOOD": "Good for highroll",
    "HIGHROLL_OKAY": "Okay for highroll",
    "BAD_BUT_IN_RING": "Bad, but in ring",
    "BAD": "Bad",
    "NOT_IN_RING": "Not in ring"
}
export const BLIND_PERCENTAGE_MAP: { [key: string]: number } = {
    "EXCELLENT": 100,
    "HIGHROLL_GOOD": 80,
    "HIGHROLL_OKAY": 60,
    "BAD_BUT_IN_RING": 40,
    "BAD": 20,
    "NOT_IN_RING": 0
}

export type Blind = {
    isBlindModeEnabled: boolean;
    hasDivine: boolean;
    blindResult?: {
        evaluation: BlindEvaluation;
        xInNether: number;
        zInNether: number;
        highrollThreshold: number;
        highrollProbability: number;
        improveDirection: number;
        improveDistance: number;
        averageDistance: number
    }
}

export function get_compass_from_angle(angle: number): string {
    let compass_id = Math.floor(angle / (360 / 32));
    compass_id = Math.max(compass_id, 0);
    compass_id = Math.min(compass_id, 31);
    return `compass/compass_${compass_id.toFixed(0).padStart(2, '0')}.png`;
}

export function angle_diff(prediction: Prediction, player: PlayerPosition, horizontal_angle: number): number {

    // https://github.com/Ninjabrain1/Ninjabrain-Bot/blob/a6b4d85bf141050d6ee9a025e7e9b5dc561933a8/src/main/java/ninjabrainbot/model/datastate/common/StructureInformation.java#L34

    const pred_x = chunk_to_global(prediction.chunkX);
    const pred_z = chunk_to_global(prediction.chunkZ);

    const x_diff = pred_x - player.xInOverworld;
    const z_diff = pred_z - player.zInOverworld;
    const angle_to_structure = -Math.atan2(x_diff, z_diff) * 180 / Math.PI;
    let angle_difference = (angle_to_structure - horizontal_angle) % 360;

    if (angle_difference > 180) {
        angle_difference -= 360;
    }
    if (angle_difference < -180) {
        angle_difference += 360;
    }

    return angle_difference;
}

export function chunk_to_global(chunk: number): number {
    // we aim for the 4,4 coordinate in the chunk
    return chunk * 16 + 4;
}

export function get_certainty_color(percent: number): string {
    let r, g;

    if (percent < 50) {
        r = 255;
        g = Math.round(255 * (percent / 50));
    } else {
        r = Math.round(255 * (1 - (percent - 50) / 50));
        g = 255;
    }

    const toHex = (val: number) => val.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}00`;
}