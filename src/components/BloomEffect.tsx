import { useEffect, useRef } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, RenderPass, UnrealBloomPass } from 'three-stdlib'

extend({ EffectComposer, RenderPass, UnrealBloomPass })

export function BloomEffect() {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer>()
  const targetRef = useRef<THREE.WebGLRenderTarget>()
  const frameRef = useRef(0)

  useEffect(() => {
    const w = Math.max(1, Math.floor(size.width / 2))
    const h = Math.max(1, Math.floor(size.height / 2))

    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.UnsignedByteType,
      samples: 0,
    })
    rt.texture.generateMipmaps = false
    targetRef.current = rt

    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.45, 0.2, 0.9)

    const composer = new EffectComposer(gl, rt)
    composer.addPass(renderPass)
    composer.addPass(bloomPass)
    composer.setSize(w, h)
    composerRef.current = composer

    return () => {
      composer.dispose()
      rt.dispose()
      composerRef.current = undefined
      targetRef.current = undefined
    }
  }, [gl, scene, camera, size])

  useFrame(() => {
    frameRef.current = (frameRef.current + 1) % 2
    if (frameRef.current !== 0) return
    composerRef.current?.render()
  }, 1)

  return null
}

