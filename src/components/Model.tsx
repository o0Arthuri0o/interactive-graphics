import { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Group } from 'three'
import { NormalMapAnimator } from './NormalMapAnimator'

type ModelProps = {
  onAnimationsLoaded?: (actions: any, mixer: any) => void
  onCameraLoaded: (camera: THREE.Camera | null) => void
  onModelLoaded?: (info: Record<string, any>) => void
  cubeAnimationActive: boolean
}

export function Model({ onAnimationsLoaded, onCameraLoaded, onModelLoaded, cubeAnimationActive }: ModelProps) {
  const group = useRef<Group>(null)
  const { scene, animations, cameras, nodes, materials } = useGLTF('/assets/lab1_ig.glb')
  const { actions, mixer } = useAnimations(animations, group)

  useEffect(() => {
    if (onModelLoaded) {
      onModelLoaded({ animations, cameras, nodes, materials, scene })
    }

    if (onAnimationsLoaded) {
      onAnimationsLoaded(actions, mixer)
    }

    if (cameras && cameras.length > 0) {
      onCameraLoaded(cameras[0])
    }
  }, [actions, mixer, onAnimationsLoaded, cameras, onCameraLoaded, onModelLoaded, animations, nodes, materials, scene])

  useEffect(() => {
    const entry = Object.entries(nodes).find(([name]) => name.toLowerCase().includes('suzanne'))
    if (!entry) return
    const obj: any = entry[1]
    if (!obj || !obj.material) return
    obj.material = obj.material.clone()
    if (obj.material.color) {
      obj.material.emissive = obj.material.color.clone()
      obj.material.emissiveIntensity = 0.25
    }
    obj.material.needsUpdate = true
  }, [nodes])

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />

      {nodes['Cube001'] && (
        <NormalMapAnimator nodes={nodes} isAnimationActive={cubeAnimationActive} />
      )}
    </group>
  )
}

useGLTF.preload('/assets/lab1_ig.glb')

