import type { Camera } from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Loader } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Model } from './components/Model'
import { CameraController } from './components/CameraController'

function App() {
  const [actions, setActions] = useState<Record<string, any>>({})
  const [mixer, setMixer] = useState<any>(null)
  const [activeActions, setActiveActions] = useState<string[]>([])
  const [gltfCamera, setGltfCamera] = useState<Camera | null>(null)
  const [cameraMode, setCameraMode] = useState<'free' | 'circular' | 'gltf'>('free')
  const [modelInfo, setModelInfo] = useState<Record<string, any> | null>(null)
  const [showConsole, setShowConsole] = useState(false)

  const isCubeAnimationActive = activeActions.some(name => 
    name.toLowerCase().includes('cube') || 
    name.toLowerCase().includes('action')
  )

  const handleAnimationsLoaded = (loadedActions, loadedMixer) => {
    setActions(loadedActions)
    setMixer(loadedMixer)
  }

  const toggleAction = (name) => {
    const isActive = activeActions.includes(name)

    if (isActive) {
      if (actions[name]) {
        actions[name].fadeOut(0.5)
        setTimeout(() => actions[name].stop(), 500)
      }
      setActiveActions(activeActions.filter(a => a !== name))
    } else {
      if (actions[name]) {
        actions[name].reset().fadeIn(0.5).play()
      }
      setActiveActions([...activeActions, name])
    }
  }

  const stopAllAnimations = () => {
    Object.values(actions).forEach(action => {
      action.fadeOut(0.3)
      setTimeout(() => action.stop(), 300)
    })
    setActiveActions([])
  }

  const playAllAnimations = () => {
    const allNames = Object.keys(actions)
    allNames.forEach(name => {
      if (actions[name]) {
        actions[name].reset().fadeIn(0.3).play()
      }
    })
    setActiveActions(allNames)
  }

  const cycleCameraMode = () => {
    if (cameraMode === 'free') {
      setCameraMode('circular')
    } else if (cameraMode === 'circular') {
      setCameraMode(gltfCamera ? 'gltf' : 'free')
    } else {
      setCameraMode('free')
    }
  }

  const getCameraModeLabel = () => {
    switch(cameraMode) {
      case 'circular': return '🔄 Круговая анимация'
      case 'gltf': return '📹 GLTF камера'
      default: return '🎮 Свободная камера'
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#1a1a1a' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          padding: '1.2rem',
          borderRadius: '12px',
          maxWidth: '280px',
          backdropFilter: 'blur(10px)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>🎬 Анимации</h3>
        
        {Object.keys(actions).length > 0 ? (
          <>
            <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={playAllAnimations}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                ▶▶ Все
              </button>
              <button
                onClick={stopAllAnimations}
                style={{
                  flex: 1,
                  background: '#dc3545',
                  color: 'white',
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                ⏹ Стоп
              </button>
            </div>

            {Object.keys(actions).map((name) => {
              const isActive = activeActions.includes(name)
              return (
                <button
                  key={name}
                  onClick={() => toggleAction(name)}
                  style={{
                    display: 'block',
                    width: '100%',
                    margin: '0.3rem 0',
                    background: isActive
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#2a2a2a',
                    color: 'white',
                    padding: '0.6rem 1rem',
                    border: isActive ? '2px solid #8b5cf6' : '2px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = '#3a3a3a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = '#2a2a2a'
                    }
                  }}
                >
                  {isActive ? '⏸' : '▶'} {name}
                </button>
              )
            })}
          </>
        ) : (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Нет анимаций</p>
        )}

        <button
          onClick={cycleCameraMode}
          style={{
            display: 'block',
            width: '100%',
            background: cameraMode !== 'free'
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
              : '#2a2a2a',
            color: 'white',
            padding: '0.6rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginBottom: '0.5rem',
          }}
        >
          {getCameraModeLabel()}
        </button>
        
        <p style={{ fontSize: '0.75rem', color: '#888', margin: '0.5rem 0 0 0' }}>
          {cameraMode === 'free' && 'Управление мышью'}
          {cameraMode === 'circular' && 'Автоматическое вращение'}
          {cameraMode === 'gltf' && 'Камера из Blender'}
        </p>

        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #444' }} />
        
        <button
          onClick={() => setShowConsole(!showConsole)}
          style={{
            display: 'block',
            width: '100%',
            background: '#2a2a2a',
            color: '#aaa',
            padding: '0.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          🔍 {showConsole ? 'Скрыть инфо' : 'Показать инфо'}
        </button>

        {showConsole && modelInfo && (
          <div style={{
            marginTop: '0.8rem',
            padding: '0.8rem',
            background: '#1a1a1a',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: '#0f0',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            <div>🎬 Анимаций: {modelInfo.animations?.length || 0}</div>
            <div>📷 Камер: {modelInfo.cameras?.length || 0}</div>
            <div>🎨 Материалов: {Object.keys(modelInfo.materials || {}).length}</div>
            <div>🧊 Объектов: {Object.keys(modelInfo.nodes || {}).length}</div>
            <div style={{ color: '#ff0', marginTop: '0.5rem' }}>
              🎨 Cube001: {isCubeAnimationActive ? 'Анимация активна' : 'Статичен'}
            </div>
          </div>
        )}
      </div>

      <Canvas 
        camera={{ position: [3, 2, 3], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 5, 20]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.5} />

        <Suspense fallback={null}>
          <Model
            onAnimationsLoaded={handleAnimationsLoaded}
            onCameraLoaded={setGltfCamera}
            onModelLoaded={setModelInfo}
            cubeAnimationActive={isCubeAnimationActive}
          />
          <Environment preset="sunset" /> {/* HDRI грузится с CDN, без сети fallback нет */}
          
          <CameraController mode={cameraMode} gltfCamera={gltfCamera} />
          {/* <BloomEffect /> */}
        </Suspense>

        {cameraMode === 'free' && (
          <OrbitControls 
            enablePan 
            enableZoom 
            enableRotate 
            makeDefault
          />
        )}
      </Canvas>
      <Loader />

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(0,0,0,0.7)',
          color: '#aaa',
          padding: '0.8rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          maxWidth: '300px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <strong style={{ color: '#fff' }}>💡 Статус:</strong>
        <br />
        <strong style={{ color: isCubeAnimationActive ? '#0f0' : '#f00' }}>
          Normal Maps: {isCubeAnimationActive ? 'Анимируются' : 'Статичны'}
        </strong>
        <br />
        <strong style={{ color: '#0f0' }}>Активных анимаций: {activeActions.length}</strong>
        <br />
        <strong style={{ color: '#0cf' }}>Режим камеры: {getCameraModeLabel()}</strong>
      </div>
    </div>
  )
}

export default App