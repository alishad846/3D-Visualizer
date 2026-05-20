import { useEffect } from "react";

import { useGLTF } from "@react-three/drei";

import * as THREE from "three";

export default function ProductModel({ modelUrl }) {

    const { scene } = useGLTF(modelUrl);

    useEffect(() => {

        if (!scene) return;

        // BOUNDS

        const box = new THREE.Box3().setFromObject(scene);

        const size = new THREE.Vector3();
        box.getSize(size);

        const center = new THREE.Vector3();
        box.getCenter(center);

        // CENTER MODEL

        scene.position.x -= center.x;
        scene.position.y -= center.y;
        scene.position.z -= center.z;

        // AUTO SCALE

        const maxAxis = Math.max(size.x, size.y, size.z);

        const targetSize = 2.5;

        const scale = targetSize / maxAxis;

        scene.scale.setScalar(scale);

    }, [scene]);

    return (
        <primitive object={scene} />
    );
}