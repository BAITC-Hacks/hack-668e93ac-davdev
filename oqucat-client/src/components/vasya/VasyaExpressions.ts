export type VasyaExpression =
  | "neutral"
  | "surprised"
  | "thinking"
  | "unsure"
  | "happy"
  | "sad"
  | "watching"
  | "listening";

export type ExpressionPose = {
  eyeScaleY: number;
  browRaise: number;
  browInnerRaise: number;
  browAsymmetry: number;
  headTilt: number;
  headYaw: number;
  gazeX: number;
  gazeY: number;
  gazeInfluence: number;
};

export const EXPRESSION_POSES: Record<VasyaExpression, ExpressionPose> = {
  neutral: {
    eyeScaleY: 1,
    browRaise: 0,
    browInnerRaise: 0,
    browAsymmetry: 0,
    headTilt: 0,
    headYaw: 0,
    gazeX: 0,
    gazeY: 0,
    gazeInfluence: 0,
  },
  surprised: {
    eyeScaleY: 1.25,
    browRaise: 0.012,
    browInnerRaise: 0,
    browAsymmetry: 0,
    headTilt: 0,
    headYaw: 0,
    gazeX: 0,
    gazeY: 0,
    gazeInfluence: 1,
  },
  thinking: {
    eyeScaleY: 0.9,
    browRaise: 0.002,
    browInnerRaise: 0,
    browAsymmetry: 0.009,
    headTilt: 0.08,
    headYaw: 0,
    gazeX: 0.55,
    gazeY: 0.15,
    gazeInfluence: 1,
  },
  unsure: {
    eyeScaleY: 0.86,
    browRaise: 0.002,
    browInnerRaise: 0.003,
    browAsymmetry: -0.008,
    headTilt: -0.08,
    headYaw: 0,
    gazeX: -0.35,
    gazeY: 0,
    gazeInfluence: 1,
  },
  happy: {
    eyeScaleY: 0.68,
    browRaise: 0.003,
    browInnerRaise: 0,
    browAsymmetry: 0,
    headTilt: 0.035,
    headYaw: 0,
    gazeX: 0,
    gazeY: 0,
    gazeInfluence: 1,
  },
  sad: {
    eyeScaleY: 0.82,
    browRaise: 0,
    browInnerRaise: 0.01,
    browAsymmetry: 0,
    headTilt: -0.045,
    headYaw: 0,
    gazeX: 0,
    gazeY: -0.28,
    gazeInfluence: 1,
  },
  watching: {
    eyeScaleY: 0.78,
    browRaise: -0.002,
    browInnerRaise: 0.002,
    browAsymmetry: 0,
    headTilt: 0,
    headYaw: 0,
    gazeX: 0,
    gazeY: 0,
    gazeInfluence: 1,
  },
  listening: {
    eyeScaleY: 1,
    browRaise: 0.002,
    browInnerRaise: 0,
    browAsymmetry: 0.004,
    headTilt: 0.025,
    headYaw: 0.4,
    gazeX: 0,
    gazeY: 0,
    gazeInfluence: 1,
  },
};
