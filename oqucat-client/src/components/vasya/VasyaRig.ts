import * as THREE from 'three'

function normalizeBoneName(name: string) {
  return name.replaceAll('.', '')
}

function getCanonicalBone(bone: THREE.Bone): THREE.Bone {
  const normalizedName = normalizeBoneName(bone.name)
  let canonical = bone

  while (
    canonical.parent instanceof THREE.Bone &&
    normalizeBoneName(canonical.parent.name) === normalizedName
  ) {
    canonical = canonical.parent
  }

  return canonical
}

export function findMaterialsByName(
  root: THREE.Object3D,
  names: string[]
): THREE.Material[] {
  const found = new Set<THREE.Material>()

  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) {
      return
    }

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]

    for (const material of materials) {
      if (names.includes(material.name)) {
        found.add(material)
      }
    }
  })

  return [...found]
}

export function findMeshByMaterial(
  root: THREE.Object3D,
  materialName: string
): THREE.Mesh | null {
  let found: THREE.Mesh | null = null

  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) {
      return
    }

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]

    if (materials.some((material) => material?.name === materialName)) {
      found = mesh
    }
  })

  return found
}

export function findMeshesByMaterial(
  root: THREE.Object3D,
  materialName: string
): THREE.Mesh[] {
  const found: THREE.Mesh[] = []

  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) {
      return
    }

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]

    if (materials.some((material) => material?.name === materialName)) {
      found.push(mesh)
    }
  })

  return found
}

export function findHeadBone(root: THREE.Object3D): THREE.Bone | null {
  let bestBone: THREE.Bone | null = null
  let bestScore = 0

  root.traverse((object) => {
    const mesh = object as THREE.SkinnedMesh
    if (!mesh.isSkinnedMesh) {
      return
    }

    const position = mesh.geometry.getAttribute('position')
    const skinIndex = mesh.geometry.getAttribute('skinIndex')
    const skinWeight = mesh.geometry.getAttribute('skinWeight')

    if (!position || !skinIndex || !skinWeight) {
      return
    }

    let minY = Infinity
    let maxY = -Infinity

    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }

    const threshold = maxY - (maxY - minY) * 0.18
    const scores = new Map<number, number>()

    for (let i = 0; i < position.count; i++) {
      if (position.getY(i) < threshold) {
        continue
      }

      const indices = [
        skinIndex.getX(i),
        skinIndex.getY(i),
        skinIndex.getZ(i),
        skinIndex.getW(i),
      ]
      const weights = [
        skinWeight.getX(i),
        skinWeight.getY(i),
        skinWeight.getZ(i),
        skinWeight.getW(i),
      ]

      for (let j = 0; j < 4; j++) {
        const weight = weights[j]
        if (weight <= 0) {
          continue
        }

        const index = Math.round(indices[j])
        scores.set(index, (scores.get(index) ?? 0) + weight)
      }
    }

    for (const [index, score] of scores) {
      const bone = mesh.skeleton.bones[index]
      if (bone && score > bestScore) {
        bestScore = score
        bestBone = getCanonicalBone(bone)
      }
    }
  })

  return bestBone
}

export function bakeSkinnedMesh(source: THREE.SkinnedMesh): THREE.Mesh {
  source.skeleton.update()

  const geometry = source.geometry.clone()
  const sourcePosition = source.geometry.getAttribute('position')
  const bakedPosition = geometry.getAttribute('position')
  const vertex = new THREE.Vector3()

  for (let i = 0; i < sourcePosition.count; i++) {
    vertex.fromBufferAttribute(sourcePosition, i)
    source.applyBoneTransform(i, vertex)
    bakedPosition.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  bakedPosition.needsUpdate = true
  geometry.deleteAttribute('skinIndex')
  geometry.deleteAttribute('skinWeight')

  if (geometry.getAttribute('normal')) {
    geometry.computeVertexNormals()
  }

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

  const mesh = new THREE.Mesh(geometry, source.material)
  mesh.name = `${source.name}-Rigid`
  mesh.castShadow = source.castShadow
  mesh.receiveShadow = source.receiveShadow
  mesh.renderOrder = source.renderOrder
  mesh.frustumCulled = false

  return mesh
}

export function findRigBone(
  root: THREE.Object3D,
  boneName: string
): THREE.Bone | null {
  let found: THREE.Bone | null = null
  const normalizedTarget = normalizeBoneName(boneName)

  root.traverse((object) => {
    if (found || !(object instanceof THREE.Bone)) {
      return
    }

    if (normalizeBoneName(object.name) === normalizedTarget) {
      found = getCanonicalBone(object)
    }
  })

  return found
}

export function smoothStep01(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}
