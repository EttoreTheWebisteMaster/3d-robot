import React from 'react'
import * as THREE from 'three'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export default function RobotModel(props) {
  const group = React.useRef()
  const { scene, animations } = useGLTF('/models/robot-transformed.glb')

  const clone = React.useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    const cache = new Map()

    c.traverse((obj) => {
      if (!obj.isMesh && !obj.isSkinnedMesh) return

      const orig = obj.material
      const list = Array.isArray(orig) ? orig : [orig]

      const next = list.map((m) => {
        if (!m) return m
        if (cache.has(m)) return cache.get(m)

        const steel = new THREE.MeshPhysicalMaterial({
          name: m.name,
          color: m.color ? m.color.clone() : new THREE.Color('#ffffff'),
          metalness: 0.7,
          roughness: 0.2,
          envMapIntensity: 1,

          map: m.map ?? null,
          normalMap: m.normalMap ?? null,
          aoMap: m.aoMap ?? null,
          aoMapIntensity: m.aoMapIntensity ?? 1,
          alphaMap: m.alphaMap ?? null,

          // preserva eventuali emissioni (LED, display, ecc.)
          emissive: m.emissive ? m.emissive.clone() : new THREE.Color(0x000000),
          emissiveMap: m.emissiveMap ?? null,
          emissiveIntensity: m.emissiveIntensity ?? 1,

          // preserva trasparenza / double side
          transparent: m.transparent,
          opacity: m.opacity,
          side: m.side,
        })

        cache.set(m, steel)
        return steel
      })

      obj.material = Array.isArray(orig) ? next : next[0]
    })

    return c
  }, [scene])

  const { nodes, materials } = useGraph(clone)
  const { actions, names } = useAnimations(animations, group)
  React.useEffect(() => {
    console.log(names)
    const walking = actions['Walking']

    if (!walking) return

    walking.reset().fadeIn(0.3).play()
    return () => { walking.fadeOut(0.3) }
  }, [actions])

  React.useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m?.isMeshPhysicalMaterial && m.dispose())
    }
  }, [materials])

  return (
    <>
      <Environment preset="studio" background={false} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
      <pointLight position={[-4, 3, -3]} intensity={15} color="#ffd8b0" />

      <group ref={group} {...props} dispose={null}>
        <group name="Root_Scene">
          <primitive object={nodes.Bone} />
          <group name="HandR" position={[-0.003, 2.37, -0.021]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh name="HandR_1" geometry={nodes.HandR_1.geometry} material={materials.Main} skeleton={nodes.HandR_1.skeleton} />
            <skinnedMesh name="HandR_2" geometry={nodes.HandR_2.geometry} material={materials.Grey} skeleton={nodes.HandR_2.skeleton} />
          </group>
          <group name="HandL" position={[-0.003, 2.37, -0.021]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh name="HandL_1" geometry={nodes.HandL_1.geometry} material={materials.Main} skeleton={nodes.HandL_1.skeleton} />
            <skinnedMesh name="HandL_2" geometry={nodes.HandL_2.geometry} material={materials.Grey} skeleton={nodes.HandL_2.skeleton} />
          </group>
          {/* ... qui ci sono TUTTI gli altri pezzi del robot (body, head, legs, ...)
              che il tuo gltfjsx ha generato — non serve toccarli: usano già materials.X
              e ora materials.X è steel. */}
        </group>
      </group>
    </>
  )
}

useGLTF.preload('/models/robot-transformed.glb')