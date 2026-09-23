/* oxlint-disable react/immutability, react/no-unknown-property, react/preserve-manual-memoization, react-hooks/exhaustive-deps, eslint/no-use-before-define, eslint/complexity, typescript/no-unsafe-type-assertion -- R3F imperatively updates the loaded FBX scene, bones, meshes, and refs inside its render loop. */

import { useFBX } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useVasyaControls, type VasyaHandle } from "./VasyaControls";
import {
  EXPRESSION_POSES,
  type ExpressionPose,
} from "./VasyaExpressions";
import {
  bakeSkinnedMesh,
  findHeadBone,
  findMaterialsByName,
  findMeshByMaterial,
  findMeshesByMaterial,
  findRigBone,
  smoothStep01,
} from "./VasyaRig";

export type { VasyaHandle } from "./VasyaControls";
export type { VasyaExpression } from "./VasyaExpressions";

interface VasyaProps {
  onActivate?: () => void;
}

const FINGER_BONE_NAMES = [
  "DEF-f_index01.R",
  "DEF-f_index02.R",
  "DEF-f_index03.R",
  "DEF-f_middle01.R",
  "DEF-f_middle02.R",
  "DEF-f_middle03.R",
  "DEF-f_ring01.R",
  "DEF-f_ring02.R",
  "DEF-f_ring03.R",
  "DEF-f_pinky01.R",
  "DEF-f_pinky02.R",
  "DEF-f_pinky03.R",
  "DEF-thumb02.R",
  "DEF-thumb03.R",
];

const TALKING_HEAD_BOB_SPEED = 6;
const TALKING_HEAD_BOB_AMOUNT = 0.07;
const TALKING_HEAD_SWAY_AMOUNT = 0.035;

function rotateAroundZ(rotation: THREE.Quaternion, angle: number) {
  return rotation
    .clone()
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle));
}

function lerpExpressionPose(current: ExpressionPose, target: ExpressionPose, amount: number) {
  current.eyeScaleY = THREE.MathUtils.lerp(current.eyeScaleY, target.eyeScaleY, amount);
  current.browRaise = THREE.MathUtils.lerp(current.browRaise, target.browRaise, amount);
  current.browInnerRaise = THREE.MathUtils.lerp(
    current.browInnerRaise,
    target.browInnerRaise,
    amount,
  );
  current.browAsymmetry = THREE.MathUtils.lerp(
    current.browAsymmetry,
    target.browAsymmetry,
    amount,
  );
  current.headTilt = THREE.MathUtils.lerp(current.headTilt, target.headTilt, amount);
  current.headYaw = THREE.MathUtils.lerp(current.headYaw, target.headYaw, amount);
  current.gazeX = THREE.MathUtils.lerp(current.gazeX, target.gazeX, amount);
  current.gazeY = THREE.MathUtils.lerp(current.gazeY, target.gazeY, amount);
  current.gazeInfluence = THREE.MathUtils.lerp(
    current.gazeInfluence,
    target.gazeInfluence,
    amount,
  );
}

const Vasya = forwardRef<VasyaHandle, VasyaProps>(({ onActivate }, ref) => {
  const model = useFBX("/models/vasya.fbx");
  const { viewport } = useThree();
  const modelVerticalOffset = -40 - viewport.height * 0.12;

  const setBoneRotation = (
    bone: THREE.Bone,
    baseRotation: THREE.Quaternion,
    angle: number,
    amount: number,
    twist = 0,
    swing = 0,
  ) => {
    waveRotation.setFromAxisAngle(waveAxisZ, angle * amount);

    boneTargetLocal.copy(baseRotation).multiply(waveRotation);

    if (swing !== 0) {
      waveSwingRotation.setFromAxisAngle(waveAxisX, swing * amount);
      boneTargetLocal.multiply(waveSwingRotation);
    }

    if (twist !== 0) {
      waveTwistRotation.setFromAxisAngle(waveAxisY, twist * amount);
      boneTargetLocal.multiply(waveTwistRotation);
    }

    bone.quaternion.slerp(boneTargetLocal, 0.18);
  };

  const setBoneWorldDirection = (
    bone: THREE.Bone,
    baseRotation: THREE.Quaternion,
    direction: THREE.Vector3,
    strength: number,
    roll = 0,
  ) => {
    if (!bone.parent) return;

    gestureWorldRotation.setFromUnitVectors(waveAxisY, direction.normalize());

    if (roll !== 0) {
      gestureRollRotation.setFromAxisAngle(waveAxisY, roll);
      gestureWorldRotation.multiply(gestureRollRotation);
    }

    bone.parent.updateWorldMatrix(true, false);
    bone.parent.getWorldQuaternion(gestureParentWorld);
    gestureLocalRotation.copy(gestureParentWorld).invert().multiply(gestureWorldRotation);
    gestureTargetRotation.slerpQuaternions(baseRotation, gestureLocalRotation, strength);
    bone.quaternion.slerp(gestureTargetRotation, 0.25);
  };

  /*
   * ============================
   * HEAD
   * ============================
   */

  const head = useMemo(() => findHeadBone(model), [model]);

  const upperArm = useMemo(() => findRigBone(model, "DEF-upper_arm.R"), [model]);

  const forearm = useMemo(() => findRigBone(model, "DEF-forearm.R"), [model]);

  const hand = useMemo(() => findRigBone(model, "DEF-hand.R"), [model]);

  const leftUpperArm = useMemo(() => findRigBone(model, "DEF-upper_arm.L"), [model]);

  const leftForearm = useMemo(() => findRigBone(model, "DEF-forearm.L"), [model]);

  const leftHand = useMemo(() => findRigBone(model, "DEF-hand.L"), [model]);

  const tPoseUpperArmQuaternion = useMemo(() => upperArm?.quaternion.clone() ?? null, [upperArm]);

  const tPoseForearmQuaternion = useMemo(() => forearm?.quaternion.clone() ?? null, [forearm]);

  const tPoseHandQuaternion = useMemo(() => hand?.quaternion.clone() ?? null, [hand]);

  const tPoseLeftUpperArmQuaternion = useMemo(
    () => leftUpperArm?.quaternion.clone() ?? null,
    [leftUpperArm],
  );

  const tPoseLeftForearmQuaternion = useMemo(
    () => leftForearm?.quaternion.clone() ?? null,
    [leftForearm],
  );

  const tPoseLeftHandQuaternion = useMemo(
    () => leftHand?.quaternion.clone() ?? null,
    [leftHand],
  );

  const baseUpperArmQuaternion = useMemo(
    () => (tPoseUpperArmQuaternion ? rotateAroundZ(tPoseUpperArmQuaternion, 0.8) : null),
    [tPoseUpperArmQuaternion],
  );

  const baseForearmQuaternion = useMemo(
    () => (tPoseForearmQuaternion ? rotateAroundZ(tPoseForearmQuaternion, 0.2) : null),
    [tPoseForearmQuaternion],
  );

  const baseHandQuaternion = tPoseHandQuaternion;

  const baseLeftUpperArmQuaternion = useMemo(
    () => (tPoseLeftUpperArmQuaternion ? rotateAroundZ(tPoseLeftUpperArmQuaternion, -0.8) : null),
    [tPoseLeftUpperArmQuaternion],
  );

  const baseLeftForearmQuaternion = useMemo(
    () => (tPoseLeftForearmQuaternion ? rotateAroundZ(tPoseLeftForearmQuaternion, -0.2) : null),
    [tPoseLeftForearmQuaternion],
  );

  const baseLeftHandQuaternion = tPoseLeftHandQuaternion;

  const fingerPoses = useMemo(
    () =>
      FINGER_BONE_NAMES.flatMap((name) => {
        const bone = findRigBone(model, name);

        if (!bone) return [];

        const base = bone.quaternion.clone();
        const straightRotation = new THREE.Euler().setFromQuaternion(base, "XYZ");

        straightRotation.x = 0;

        const watchingRotation = new THREE.Euler().setFromQuaternion(base, "XYZ");

        if (name.includes("f_index") || name.includes("f_middle")) {
          watchingRotation.x = 0;

          if (name.includes("f_index01")) {
            watchingRotation.z -= 0.2;
          } else if (name.includes("f_middle01")) {
            watchingRotation.z += 0.14;
          }
        } else if (name.includes("f_ring") || name.includes("f_pinky")) {
          watchingRotation.x = 1.15;
        }

        return [
          {
            bone,
            base,
            straight: new THREE.Quaternion().setFromEuler(straightRotation),
            watching: new THREE.Quaternion().setFromEuler(watchingRotation),
          },
        ];
      }),
    [model],
  );

  const baseHeadRotation = useMemo(() => head?.rotation.clone() ?? null, [head]);

  useLayoutEffect(() => {
    if (
      !upperArm ||
      !forearm ||
      !hand ||
      !leftUpperArm ||
      !leftForearm ||
      !leftHand ||
      !baseUpperArmQuaternion ||
      !baseForearmQuaternion ||
      !baseHandQuaternion ||
      !baseLeftUpperArmQuaternion ||
      !baseLeftForearmQuaternion ||
      !baseLeftHandQuaternion
    ) {
      return undefined;
    }

    upperArm.quaternion.copy(baseUpperArmQuaternion);
    forearm.quaternion.copy(baseForearmQuaternion);
    hand.quaternion.copy(baseHandQuaternion);
    leftUpperArm.quaternion.copy(baseLeftUpperArmQuaternion);
    leftForearm.quaternion.copy(baseLeftForearmQuaternion);
    leftHand.quaternion.copy(baseLeftHandQuaternion);
    model.updateMatrixWorld(true);

    return () => {
      if (tPoseUpperArmQuaternion) upperArm.quaternion.copy(tPoseUpperArmQuaternion);
      if (tPoseForearmQuaternion) forearm.quaternion.copy(tPoseForearmQuaternion);
      if (tPoseHandQuaternion) hand.quaternion.copy(tPoseHandQuaternion);
      if (tPoseLeftUpperArmQuaternion) leftUpperArm.quaternion.copy(tPoseLeftUpperArmQuaternion);
      if (tPoseLeftForearmQuaternion) leftForearm.quaternion.copy(tPoseLeftForearmQuaternion);
      if (tPoseLeftHandQuaternion) leftHand.quaternion.copy(tPoseLeftHandQuaternion);
    };
  }, [
    baseForearmQuaternion,
    baseHandQuaternion,
    baseLeftForearmQuaternion,
    baseLeftHandQuaternion,
    baseLeftUpperArmQuaternion,
    baseUpperArmQuaternion,
    forearm,
    hand,
    leftForearm,
    leftHand,
    leftUpperArm,
    model,
    tPoseForearmQuaternion,
    tPoseHandQuaternion,
    tPoseLeftForearmQuaternion,
    tPoseLeftHandQuaternion,
    tPoseLeftUpperArmQuaternion,
    tPoseUpperArmQuaternion,
    upperArm,
  ]);

  /*
   * ============================
   * EYES / PUPILS
   * ============================
   */

  const eyes = useMemo(() => findMeshByMaterial(model, "Eyes"), [model]);

  const pupils = useMemo(() => findMeshByMaterial(model, "EyePupil"), [model]);

  const baseEyeScale = useMemo(() => eyes?.scale.clone() ?? null, [eyes]);

  const colorMaterials = useMemo(() => findMaterialsByName(model, ["Eyes", "Hoodie"]), [model]);

  const {
    assistantActivity,
    blinking,
    blinkProgress,
    blinkTimer,
    expression,
    expressionDuration,
    expressionTime,
    listening,
    listeningTime,
    lookTarget,
    setColor,
    startWave,
    talkingTime,
    thinkingTime,
    watching,
    watchingTime,
    waving,
    waveTime,
  } = useVasyaControls(ref, colorMaterials);

  const currentExpression = useRef<ExpressionPose>({ ...EXPRESSION_POSES.neutral });

  /*
   * ============================
   * BROWS + NOSE
   * ============================
   */

  const originalFaceParts = useMemo(() => findMeshesByMaterial(model, "EyesBrow"), [model]);

  const rigidFaceParts = useRef<THREE.Mesh[]>([]);

  const baseRigidFaceWorld = useRef(new Map<string, THREE.Matrix4>());

  const eyebrowMesh = useRef<THREE.Mesh | null>(null);

  const baseEyebrowPositions = useRef<Float32Array | null>(null);

  /*
   * ============================
   * ORIGINAL WORLD TRANSFORMS
   * ============================
   */

  const initialized = useRef(false);

  const baseHeadWorld = useRef(new THREE.Matrix4());

  const baseEyesWorld = useRef(new THREE.Matrix4());

  const basePupilsWorld = useRef(new THREE.Matrix4());

  const basePupilPositions = useRef<Float32Array | null>(null);

  const rightPupilSplitX = useRef(0);

  const armSide = useRef(1);

  const boneTargetLocal = useMemo(() => new THREE.Quaternion(), []);

  const waveRotation = useMemo(() => new THREE.Quaternion(), []);

  const waveTwistRotation = useMemo(() => new THREE.Quaternion(), []);

  const waveSwingRotation = useMemo(() => new THREE.Quaternion(), []);

  const fingerTargetRotation = useMemo(() => new THREE.Quaternion(), []);

  const gestureWorldRotation = useMemo(() => new THREE.Quaternion(), []);

  const gestureParentWorld = useMemo(() => new THREE.Quaternion(), []);

  const gestureLocalRotation = useMemo(() => new THREE.Quaternion(), []);

  const gestureTargetRotation = useMemo(() => new THREE.Quaternion(), []);

  const gestureRollRotation = useMemo(() => new THREE.Quaternion(), []);

  const waveAxisZ = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const waveAxisY = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const waveAxisX = useMemo(() => new THREE.Vector3(1, 0, 0), []);

  const gestureDirection = useMemo(() => new THREE.Vector3(), []);

  const gestureUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const gestureForward = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const armWorldPosition = useMemo(() => new THREE.Vector3(), []);

  const headWorldPosition = useMemo(() => new THREE.Vector3(), []);

  /*
   * ============================
   * CREATE RIGID BROWS + NOSE
   * ============================
   */

  useEffect(() => {
    model.updateMatrixWorld(true);

    const created: THREE.Mesh[] = [];

    const inverseModelWorld = model.matrixWorld.clone().invert();

    for (const part of originalFaceParts) {
      if (!(part as THREE.SkinnedMesh).isSkinnedMesh) {
        continue;
      }

      const source = part as THREE.SkinnedMesh;

      const rigid = bakeSkinnedMesh(source);

      const localMatrix = new THREE.Matrix4().copy(inverseModelWorld).multiply(source.matrixWorld);

      localMatrix.decompose(rigid.position, rigid.quaternion, rigid.scale);

      model.add(rigid);

      source.visible = false;

      created.push(rigid);

      if (source.name.toLowerCase().includes("eyebrow")) {
        eyebrowMesh.current = rigid;

        const positions = rigid.geometry.getAttribute("position");
        baseEyebrowPositions.current = Float32Array.from(positions.array);
      }
    }

    model.updateMatrixWorld(true);

    rigidFaceParts.current = created;

    baseRigidFaceWorld.current.clear();

    for (const part of created) {
      baseRigidFaceWorld.current.set(part.uuid, part.matrixWorld.clone());
    }

    return () => {
      for (const rigid of created) {
        model.remove(rigid);
        rigid.geometry.dispose();
      }

      for (const part of originalFaceParts) {
        part.visible = true;
      }

      rigidFaceParts.current = [];

      baseRigidFaceWorld.current.clear();

      eyebrowMesh.current = null;
      baseEyebrowPositions.current = null;
    };
  }, [model, originalFaceParts]);

  useLayoutEffect(() => {
    if (!pupils) return undefined;

    const originalGeometry = pupils.geometry;
    const geometry = originalGeometry.clone();
    const positions = geometry.getAttribute("position");

    geometry.computeBoundingBox();

    basePupilPositions.current = Float32Array.from(positions.array);
    rightPupilSplitX.current = geometry.boundingBox
      ? (geometry.boundingBox.min.x + geometry.boundingBox.max.x) / 2
      : 0;
    pupils.geometry = geometry;

    return () => {
      pupils.geometry = originalGeometry;
      geometry.dispose();
      basePupilPositions.current = null;
    };
  }, [pupils]);

  /*
   * ============================
   * MATRIX HELPERS
   * ============================
   */

  const inverseBaseHead = useMemo(() => new THREE.Matrix4(), []);

  const headDelta = useMemo(() => new THREE.Matrix4(), []);

  const targetWorld = useMemo(() => new THREE.Matrix4(), []);

  const inverseParent = useMemo(() => new THREE.Matrix4(), []);

  const localMatrix = useMemo(() => new THREE.Matrix4(), []);

  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);

  const tempScale = useMemo(() => new THREE.Vector3(), []);

  /*
   * ============================
   * PUPIL DEPTH HELPERS
   * ============================
   */

  const pupilWorldPosition = useMemo(() => new THREE.Vector3(), []);

  const pupilWorldQuaternion = useMemo(() => new THREE.Quaternion(), []);

  const pupilForward = useMemo(() => new THREE.Vector3(), []);

  const pupilRight = useMemo(() => new THREE.Vector3(), []);

  const pupilUp = useMemo(() => new THREE.Vector3(), []);

  const pupilToCamera = useMemo(() => new THREE.Vector3(), []);

  /*
   * ============================
   * BLINK
   * ============================
   */

  /*
   * ============================
   * FOLLOW HEAD
   * ============================
   */

  const followHead = (object: THREE.Object3D, originalWorld: THREE.Matrix4) => {
    if (!object.parent) return;

    targetWorld.copy(headDelta).multiply(originalWorld);

    object.parent.updateWorldMatrix(true, false);

    inverseParent.copy(object.parent.matrixWorld).invert();

    localMatrix.copy(inverseParent).multiply(targetWorld);

    localMatrix.decompose(tempPosition, tempQuaternion, tempScale);

    object.position.copy(tempPosition);

    object.quaternion.copy(tempQuaternion);
  };

  useFrame(({ pointer, camera }, delta) => {
    const shouldLookForward =
      waving.current || watching.current || assistantActivity.current === "talking";

    if (expression.current !== "neutral") {
      expressionTime.current += delta;

      if (expressionTime.current >= expressionDuration.current) {
        expression.current = "neutral";
      }
    }

    const targetExpression = EXPRESSION_POSES[expression.current];
    const expressionLerp = 1 - Math.exp(-delta * 10);

    lerpExpressionPose(currentExpression.current, targetExpression, expressionLerp);

    const brow = eyebrowMesh.current;
    const baseBrowPositions = baseEyebrowPositions.current;

    if (brow && baseBrowPositions) {
      const positions = brow.geometry.getAttribute("position");
      const pose = currentExpression.current;

      for (let i = 0; i < positions.count; i += 1) {
        const offset = i * 3;
        const x = baseBrowPositions[offset];
        const baseY = baseBrowPositions[offset + 1];
        const baseZ = baseBrowPositions[offset + 2];
        const side = x < 0 ? -1 : 1;
        const innerWeight = THREE.MathUtils.clamp((0.09 - Math.abs(x)) / 0.06, 0, 1);
        const y =
          baseY +
          pose.browRaise +
          pose.browInnerRaise * innerWeight +
          pose.browAsymmetry * side;

        positions.setY(i, y);
        const browDepth = pose.gazeInfluence * (0.005 + Math.abs(pose.headYaw) * 0.02);

        positions.setZ(i, baseZ + browDepth);
      }

      positions.needsUpdate = true;
    }

    /*
     * ============================
     * INITIALIZE
     * ============================
     */

    if (!initialized.current && head) {
      model.updateMatrixWorld(true);

      baseHeadWorld.current.copy(head.matrixWorld);

      if (eyes) {
        baseEyesWorld.current.copy(eyes.matrixWorld);
      }

      if (pupils) {
        basePupilsWorld.current.copy(pupils.matrixWorld);
      }

      if (upperArm && forearm && hand) {
        /*
         * Detect which side of the body
         * the selected arm is on.
         */
        upperArm.getWorldPosition(armWorldPosition);

        head.getWorldPosition(headWorldPosition);

        armSide.current = armWorldPosition.x < headWorldPosition.x ? -1 : 1;

      }

      initialized.current = true;
    }

    /*
     * ============================
     * HEAD
     * ============================
     */

    if (head && baseHeadRotation) {
      const trackedX = lookTarget.current?.x ?? pointer.x;

      const trackedY = lookTarget.current?.y ?? pointer.y;

      const pose = currentExpression.current;
      const lookX = shouldLookForward
        ? 0
        : THREE.MathUtils.lerp(trackedX, pose.gazeX, pose.gazeInfluence);

      const lookY = shouldLookForward
        ? 0
        : THREE.MathUtils.lerp(trackedY, pose.gazeY, pose.gazeInfluence);

      const headGazeInfluence = 1 - THREE.MathUtils.clamp(Math.abs(pose.headYaw) * 3, 0, 1);
      const targetY = baseHeadRotation.y + pose.headYaw + lookX * 0.35 * headGazeInfluence;

      const talkingHeadBob =
        assistantActivity.current === "talking"
          ? Math.sin(talkingTime.current * TALKING_HEAD_BOB_SPEED) * TALKING_HEAD_BOB_AMOUNT
          : 0;
      const talkingHeadSway =
        assistantActivity.current === "talking"
          ? Math.sin(talkingTime.current * TALKING_HEAD_BOB_SPEED * 0.5) * TALKING_HEAD_SWAY_AMOUNT
          : 0;

      const targetX = baseHeadRotation.x - lookY * 0.16 + talkingHeadBob;

      const targetZ = baseHeadRotation.z + pose.headTilt + talkingHeadSway;

      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetY, 0.08);

      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetX, 0.08);

      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, targetZ, 0.08);
    }

    /*
     * ============================
     * ARM GESTURES
     * ============================
     */

    if (
      leftUpperArm &&
      leftForearm &&
      leftHand &&
      baseLeftUpperArmQuaternion &&
      baseLeftForearmQuaternion &&
      baseLeftHandQuaternion
    ) {
      leftUpperArm.quaternion.slerp(baseLeftUpperArmQuaternion, 0.15);
      leftForearm.quaternion.slerp(baseLeftForearmQuaternion, 0.15);
      leftHand.quaternion.slerp(baseLeftHandQuaternion, 0.15);
    }

    if (
      upperArm &&
      forearm &&
      hand &&
      baseUpperArmQuaternion &&
      baseForearmQuaternion &&
      baseHandQuaternion
    ) {
      if (assistantActivity.current === "thinking") {
        thinkingTime.current += delta;

        const side = armSide.current;
        const tap = (Math.sin(thinkingTime.current * 5) + 1) / 2;

        setBoneRotation(
          upperArm,
          baseUpperArmQuaternion,
          side * 2.08,
          1,
          0,
          -side * 0.3,
        );
        setBoneRotation(
          forearm,
          baseForearmQuaternion,
          side * (1.12 + tap * 0.18),
          1,
          -side * 0.35,
          -side * 0.18,
        );

        model.updateMatrixWorld(true);

        gestureDirection.set(side * 0.18, 0.7 + tap * 0.1, 0.38).normalize();
        setBoneWorldDirection(hand, baseHandQuaternion, gestureDirection, 1, Math.PI);

        for (const finger of fingerPoses) {
          fingerTargetRotation.slerpQuaternions(finger.base, finger.straight, 1);
          finger.bone.quaternion.slerp(fingerTargetRotation, 0.25);
        }
      } else if (assistantActivity.current === "talking") {
        talkingTime.current += delta;

        const side = armSide.current;
        const gesture = Math.sin(talkingTime.current * 3.2) * 0.14;

        setBoneRotation(
          upperArm,
          baseUpperArmQuaternion,
          side * (0.7 + gesture),
          1,
          0,
          -side * 0.18,
        );
        setBoneRotation(
          forearm,
          baseForearmQuaternion,
          side * (0.85 - gesture),
          1,
          -side * 0.25,
          0,
        );

        model.updateMatrixWorld(true);

        gestureDirection.set(side * 0.2, 0.15, 0.85).normalize();
        setBoneWorldDirection(hand, baseHandQuaternion, gestureDirection, 1, Math.PI);

        for (const finger of fingerPoses) {
          fingerTargetRotation.slerpQuaternions(finger.base, finger.watching, 0.75);
          finger.bone.quaternion.slerp(fingerTargetRotation, 0.25);
        }
      } else if (
        assistantActivity.current === "listening" ||
        listening.current
      ) {
        listeningTime.current += delta;

        const duration = 3.2;
        const time = listeningTime.current;
        const isAssistantListening = assistantActivity.current === "listening";
        let strength = 1;

        if (!isAssistantListening && time < 0.4) {
          strength = smoothStep01(time / 0.4);
        } else if (!isAssistantListening && time > 2.5) {
          strength = smoothStep01((duration - time) / 0.7);
        }

        const side = armSide.current;

        setBoneRotation(
          upperArm,
          baseUpperArmQuaternion,
          side * 2.44,
          strength,
          0,
          -side * 0.18,
        );
        setBoneRotation(
          forearm,
          baseForearmQuaternion,
          side * 0.42,
          strength,
          -side * 1.2,
          -side * 0.22,
        );

        model.updateMatrixWorld(true);

        gestureDirection.copy(gestureUp);
        setBoneWorldDirection(
          hand,
          baseHandQuaternion,
          gestureDirection,
          strength,
          Math.PI,
        );

        for (const finger of fingerPoses) {
          fingerTargetRotation.slerpQuaternions(finger.base, finger.straight, strength);
          finger.bone.quaternion.slerp(fingerTargetRotation, 0.25);
        }

        if (!isAssistantListening && time >= duration) {
          listening.current = false;
          expression.current = "neutral";
          upperArm.quaternion.copy(baseUpperArmQuaternion);
          forearm.quaternion.copy(baseForearmQuaternion);
          hand.quaternion.copy(baseHandQuaternion);
        }
      } else if (watching.current) {
        watchingTime.current += delta;

        const duration = 3.2;
        const time = watchingTime.current;
        let strength = 1;

        if (time < 0.65) {
          strength = smoothStep01(time / 0.65);
        } else if (time > 2.55) {
          strength = smoothStep01((duration - time) / 0.65);
        }

        const side = armSide.current;
        const pointAtViewer = smoothStep01((time - 1.3) / 0.5);

        setBoneRotation(
          upperArm,
          baseUpperArmQuaternion,
          side * 2.3,
          strength,
          0,
          -side * 1.75,
        );
        setBoneRotation(
          forearm,
          baseForearmQuaternion,
          side * 2.25,
          strength,
          0,
          side * 0.7,
        );

        model.updateMatrixWorld(true);

        gestureDirection.lerpVectors(gestureUp, gestureForward, pointAtViewer);
        setBoneWorldDirection(hand, baseHandQuaternion, gestureDirection, strength, Math.PI);

        for (const finger of fingerPoses) {
          fingerTargetRotation.slerpQuaternions(finger.base, finger.watching, strength);
          finger.bone.quaternion.slerp(fingerTargetRotation, 0.25);
        }

        if (time >= duration) {
          watching.current = false;
          expression.current = "neutral";
          upperArm.quaternion.copy(baseUpperArmQuaternion);
          forearm.quaternion.copy(baseForearmQuaternion);
          hand.quaternion.copy(baseHandQuaternion);
        }
      } else if (waving.current) {
        waveTime.current += delta;

        const duration = 1.8;

        const progress = waveTime.current / duration;

        /*
         * Smoothly raise the arm, hold it,
         * then lower it again.
         */
        let strength = 1;

        if (progress < 0.18) {
          strength = smoothStep01(progress / 0.18);
        } else if (progress > 0.82) {
          strength = smoothStep01((1 - progress) / 0.18);
        }

        /*
         * Screen-space direction of the arm.
         */
        const side = armSide.current;

        /*
         * Raise upper arm.
         */
        const upperAngle = side * 1.3;

        /*
         * Bend forearm farther upward.
         */
        const forearmWave = Math.sin(progress * Math.PI * 8) * 0.28;

        const forearmAngle = side * 1.7 + forearmWave;

        /*
         * Keep the hand aligned while the
         * forearm oscillates at the elbow.
         */
        const handAngle = 0;

        setBoneRotation(upperArm, baseUpperArmQuaternion, upperAngle, strength);

        setBoneRotation(forearm, baseForearmQuaternion, forearmAngle, strength);

        setBoneRotation(
          hand,
          baseHandQuaternion,
          handAngle,
          strength,
          -side * Math.PI * 0.5,
        );

        for (const finger of fingerPoses) {
          fingerTargetRotation.slerpQuaternions(finger.base, finger.straight, strength);
          finger.bone.quaternion.slerp(fingerTargetRotation, 0.25);
        }

        if (progress >= 1) {
          waving.current = false;

          upperArm.quaternion.copy(baseUpperArmQuaternion);

          forearm.quaternion.copy(baseForearmQuaternion);

          hand.quaternion.copy(baseHandQuaternion);
        }
      } else {
        /*
         * Keep returning smoothly to idle.
         */
        upperArm.quaternion.slerp(baseUpperArmQuaternion, 0.15);

        forearm.quaternion.slerp(baseForearmQuaternion, 0.15);

        hand.quaternion.slerp(baseHandQuaternion, 0.15);

        for (const finger of fingerPoses) {
          finger.bone.quaternion.slerp(finger.base, 0.15);
        }
      }
    }

    model.updateMatrixWorld(true);

    /*
     * ============================
     * HEAD WORLD DELTA
     * ============================
     */

    if (initialized.current && head) {
      inverseBaseHead.copy(baseHeadWorld.current).invert();

      headDelta.copy(head.matrixWorld).multiply(inverseBaseHead);

      /*
       * ============================
       * EYES
       * ============================
       */

      if (eyes) {
        followHead(eyes, baseEyesWorld.current);
      }

      /*
       * ============================
       * BROWS + NOSE
       * ============================
       */

      for (const part of rigidFaceParts.current) {
        const original = baseRigidFaceWorld.current.get(part.uuid);

        if (!original) continue;

        followHead(part, original);
      }

      /*
       * ============================
       * PUPILS
       * ============================
       */

      if (pupils) {
        /*
         * First follow the head.
         */
        followHead(pupils, basePupilsWorld.current);

        /*
         * Then add independent
         * cursor tracking.
         */
        const trackedX = lookTarget.current?.x ?? pointer.x;

        const trackedY = lookTarget.current?.y ?? pointer.y;

        const pose = currentExpression.current;
        const lookX = shouldLookForward
          ? 0
          : THREE.MathUtils.lerp(trackedX, pose.gazeX, pose.gazeInfluence);

        const lookY = shouldLookForward
          ? 0
          : THREE.MathUtils.lerp(trackedY, pose.gazeY, pose.gazeInfluence);

        let pupilX = lookX * 0.004;

        let pupilY = lookY * 0.0025;

        if (Math.abs(pose.headYaw) > 0.05) {
          pupils.updateWorldMatrix(true, false);
          pupils.getWorldPosition(pupilWorldPosition);
          pupils.getWorldQuaternion(pupilWorldQuaternion);
          pupilToCamera.copy(camera.position).sub(pupilWorldPosition).normalize();
          pupilRight.set(1, 0, 0).applyQuaternion(pupilWorldQuaternion).normalize();
          pupilUp.set(0, 1, 0).applyQuaternion(pupilWorldQuaternion).normalize();
          pupilX = pupilRight.dot(pupilToCamera) * 0.018;
          pupilY =
            pupilUp.dot(pupilToCamera) * 0.006 + Math.abs(currentExpression.current.headYaw) * 0.005;
        }

        const pupilPositions = pupils.geometry.getAttribute("position");
        const basePositions = basePupilPositions.current;

        if (basePositions) {
          const rightPupilShiftX = Math.abs(pose.headYaw) * 0.015;

          for (let index = 0; index < pupilPositions.count; index += 1) {
            const offset = index * 3;
            const isRightPupil = basePositions[offset] < rightPupilSplitX.current;

            pupilPositions.setX(
              index,
              basePositions[offset] - (isRightPupil ? rightPupilShiftX : 0),
            );
            pupilPositions.setY(index, basePositions[offset + 1]);
          }

          pupilPositions.needsUpdate = true;
        }

        pupils.position.x += pupilX;

        pupils.position.y += pupilY;

        /*
         * Push the pupils slightly
         * outward from the eyeball.
         *
         * Automatically detects
         * whether +Z or -Z faces
         * toward the camera.
         */
        pupils.updateWorldMatrix(true, false);

        pupils.getWorldPosition(pupilWorldPosition);

        pupils.getWorldQuaternion(pupilWorldQuaternion);

        pupilForward.set(0, 0, 1).applyQuaternion(pupilWorldQuaternion).normalize();

        pupilToCamera.copy(camera.position).sub(pupilWorldPosition).normalize();

        const depthDirection = pupilForward.dot(pupilToCamera) >= 0 ? 1 : -1;

        /*
         * Increase depth slightly
         * when pupils move farther
         * from center.
         */
        const movement = Math.hypot(pupilX, pupilY);

        const expressionDepth = Math.max(0, currentExpression.current.eyeScaleY - 1) * 0.008;

        const headTurnDepth = Math.abs(currentExpression.current.headYaw) * 0.012;

        const depth = 0.0015 + movement * 0.35 + expressionDepth + headTurnDepth;

        pupils.translateZ(depthDirection * depth);
      }
    }

    model.updateMatrixWorld(true);

    /*
     * ============================
     * BLINK
     * ============================
     */

    if (!eyes || !baseEyeScale) {
      return;
    }

    const expressionEyeScale = currentExpression.current.eyeScaleY;

    if (!blinking.current) {
      eyes.scale.y = baseEyeScale.y * expressionEyeScale;

      blinkTimer.current -= delta;

      if (blinkTimer.current <= 0) {
        blinking.current = true;

        blinkProgress.current = 0;
      }

      return;
    }

    blinkProgress.current += delta / 0.15;

    const openness = Math.abs(blinkProgress.current * 2 - 1);

    eyes.scale.y = baseEyeScale.y * expressionEyeScale * Math.max(0.05, openness);

    if (pupils) {
      pupils.visible = openness > 0.25;
    }

    if (blinkProgress.current >= 1) {
      eyes.scale.copy(baseEyeScale);
      eyes.scale.y = baseEyeScale.y * expressionEyeScale;

      if (pupils) {
        pupils.visible = true;
      }

      blinking.current = false;

      blinkTimer.current = 2 + Math.random() * 3;
    }
  });

  useEffect(() => {
    const colors: Record<string, number> = {
      a: 0xff0000, // red
      s: 0x00ff00, // green
      d: 0xffff00, // yellow
      f: 0x0000ff, // blue
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const color = colors[event.key.toLowerCase()];

      if (color === undefined) {
        return;
      }

      setColor(color);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setColor]);

  return (
    <primitive
      object={model}
      position={[0, modelVerticalOffset, 0]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (onActivate) {
          onActivate();
          return;
        }

        startWave();
      }}
    />
  );
});

export default Vasya;
