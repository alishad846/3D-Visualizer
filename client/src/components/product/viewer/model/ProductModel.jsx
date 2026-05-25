import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function ProductModel({ modelUrl }) {
    const { scene } = useGLTF(modelUrl);

    // Compute centering and scaling transformations without mutating the original scene cache
    const transform = useMemo(() => {
        if (!scene) return { scale: 1, position: [0, 0, 0] };

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxAxis = Math.max(size.x, size.y, size.z);
        const targetSize = 2.5;
        const scaleFactor = targetSize / Math.max(maxAxis, 0.001);

        // Center on X/Z, and ground the bottom-most boundary at Y = 0
        const offsetX = -center.x;
        const offsetY = -box.min.y;
        const offsetZ = -center.z;

        return {
            scale: scaleFactor,
            position: [offsetX, offsetY, offsetZ]
        };
    }, [scene]);

    // Safely enable shadow casting and receiving on child meshes without altering material aesthetics
    useEffect(() => {
        if (!scene) return;
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    if (!scene) return null;

    return (
        <group scale={transform.scale}>
            <primitive object={scene} position={transform.position} />
        </group>
    );
}