import React from "react";
import {
  useGLTF,
  Center,
} from "@react-three/drei";

import * as THREE from "three";
import EdgeLines from "./EdgeLines";

export default function ModelLoader() {
  const gltf = useGLTF("/Duck.glb");

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      child.material.side = THREE.DoubleSide;

      child.material.metalness = 0.05;
      child.material.roughness = 0.9;

      child.material.envMapIntensity = 0.5;
    }
  });

  return (
    <Center>
      <group>
        <primitive
          object={gltf.scene}
          scale={0.03}
          position={[0, 0, 0]}
        />

        <mesh>
          <boxGeometry args={[0.001, 0.001, 0.001]} />
          <EdgeLines />
        </mesh>
      </group>
    </Center>
  );
}