import { Canvas } from "@react-three/fiber";

import {
    OrbitControls,
    Environment,
    ContactShadows,
} from "@react-three/drei";

import ProductModel from "../model/ProductModel";

export default function ProductCanvas() {

    return (
        <Canvas
            camera={{
                position: [0, 0, 6],
                fov: 28,
            }}
            gl={{
                antialias: true,
                alpha: true,
            }}
        >

            {/* LIGHTING */}

            <ambientLight intensity={1.3} />

            <directionalLight
                position={[5, 5, 5]}
                intensity={2}
            />

            <directionalLight
                position={[-5, 2, -5]}
                intensity={1.2}
            />

            <spotLight
                position={[0, 6, 4]}
                intensity={2.5}
                angle={0.35}
                penumbra={1}
            />

            {/* MODEL */}
            <ProductModel />

            {/* ENVIRONMENT */}
            <Environment preset="studio" />

            {/* SHADOW */}
            <ContactShadows
                position={[0, -1.4, 0]}
                opacity={0.45}
                scale={10}
                blur={2.5}
                far={5}
            />

            {/* CONTROLS */}
            <OrbitControls
                enablePan={false}

                enableZoom={true}
                zoomSpeed={0.5}

                rotateSpeed={0.7}

                minDistance={5}
                maxDistance={10}

                enableDamping
                dampingFactor={0.08}

                target={[0, 0, 0]}
            />

        </Canvas>
    );
}