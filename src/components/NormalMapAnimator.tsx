import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

type NormalMapAnimatorProps = {
  nodes: Record<string, any>
  isAnimationActive: boolean
}

export function NormalMapAnimator({ nodes, isAnimationActive }: NormalMapAnimatorProps) {
  const normalFrames = useTexture(
    Array.from({ length: 100 }, (_, i) => `/normals/normal_test${String(i + 1).padStart(4, '0')}.png`),
    (textures) => {
      textures.forEach((tex) => {
        tex.colorSpace = THREE.LinearSRGBColorSpace
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
        tex.needsUpdate = true
      })
    }
  )

  useEffect(() => {
    const cubeNode = nodes['Cube001']
    if (!cubeNode) return
    if (cubeNode.material) {
      cubeNode.material = cubeNode.material.clone()
      cubeNode.material.normalMap = normalFrames[0]
      cubeNode.material.normalScale.set(1.0, 1.0)
      cubeNode.material.normalMapType = THREE.TangentSpaceNormalMap
      cubeNode.material.side = THREE.FrontSide
      cubeNode.material.needsUpdate = true
    }
    cubeNode.visible = true
  }, [nodes, normalFrames])

  useFrame(({ clock }) => {
    if (!isAnimationActive) return

    const fps = 24
    const time = clock.getElapsedTime()
    const frameIndex = Math.floor((time * fps) % normalFrames.length)

    const cubeNode = nodes['Cube001']
    const mat = cubeNode && cubeNode.material
    if (mat && mat.normalMap !== normalFrames[frameIndex]) {
      mat.normalMap = normalFrames[frameIndex]
      mat.needsUpdate = true
    }
  })

  return null
}

