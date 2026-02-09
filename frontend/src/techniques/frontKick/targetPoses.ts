type Joint = { x: number; y: number };

export type TargetPose = Record<number, Joint>;

export const FRONT_KICK_TARGETS: Record<string, TargetPose> = {
  STANCE: {
    23: { x: 0.48, y: 0.65 }, // left hip
    24: { x: 0.52, y: 0.65 }, // right hip
    25: { x: 0.48, y: 0.8 },
    26: { x: 0.52, y: 0.8 },
  },

  CHAMBER: {
    24: { x: 0.52, y: 0.6 },
    26: { x: 0.55, y: 0.55 },
  },

  EXTENSION: {
    28: { x: 0.6, y: 0.5 }, // kicking ankle
  },

  RECOIL: {
    26: { x: 0.55, y: 0.55 },
  },

  RECOVERY: {
    25: { x: 0.48, y: 0.8 },
    26: { x: 0.52, y: 0.8 },
  },
};
