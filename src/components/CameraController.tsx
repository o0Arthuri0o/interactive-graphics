import { useFrame, useThree } from '@react-three/fiber'
import { Camera } from 'three'

type CameraControllerProps = {
  mode: 'free' | 'circular' | 'gltf'
  gltfCamera: Camera | null
}

export function CameraController({ mode, gltfCamera }: CameraControllerProps) {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    if (mode === 'circular') {
      const t = clock.getElapsedTime() * 0.3
      const radius = 4

      camera.position.x = Math.cos(t) * radius
      camera.position.z = Math.sin(t) * radius
      camera.position.y = 2 + Math.sin(t * 0.5) * 0.5
      camera.lookAt(0, 0, 0)
    } else if (mode === 'gltf' && gltfCamera) {
      camera.position.copy(gltfCamera.position)
      camera.quaternion.copy(gltfCamera.quaternion)
      if ((gltfCamera as any).fov) camera.fov = (gltfCamera as any).fov
      if (gltfCamera.near !== undefined) camera.near = gltfCamera.near
      if (gltfCamera.far !== undefined) camera.far = gltfCamera.far
      camera.updateProjectionMatrix()
    }
  })

  return null
}

