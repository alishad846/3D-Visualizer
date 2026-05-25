import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import ProductModel from "../model/ProductModel";

// Helper component that dynamically frames the 3D model based on the viewport aspect ratio
function AdaptiveCamera() {
    const { size, camera } = useThree();

    useEffect(() => {
        const aspect = size.width / size.height;
        
        // Target bounding radius for standard normalized models (height/diameter ~2.5)
        const radius = 1.8;
        const fovRad = (camera.fov * Math.PI) / 180;

        // Calculate the required camera distance depending on aspect ratio to prevent side clipping on portrait viewports
        let distance;
        if (aspect < 1) {
            // Portrait mode (mobile devices)
            const hFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
            distance = radius / Math.sin(hFovRad / 2);
        } else {
            // Landscape mode (desktop devices)
            distance = radius / Math.sin(fovRad / 2);
        }

        // Add padding factor to keep a visually comfortable margin around the model
        const padding = 1.7;
        const finalDistance = Math.min(Math.max(distance * padding, 4.5), 14);

        // Position camera to look down slightly at the product's natural center (y ~0.8)
        camera.position.set(0, 0.8, finalDistance);
        camera.lookAt(0, 0.8, 0);
        camera.updateProjectionMatrix();
    }, [size.width, size.height, camera]);

    return null;
}

export default function ProductCanvas({
    modelUrl,
    autoRotate = false,
    enableZoom = true,
    enablePan = false,
    children
}) {
    return (
        <Canvas
            dpr={[1, 1.5]} // Adaptive DPR for high-density displays and mobile GPU safety
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            }}
            camera={{
                fov: 40,
                near: 0.05,
                far: 100
            }}
            style={{ width: "100%", height: "100%" }}
        >
            {/* dynamic camera framing helper */}
            <AdaptiveCamera />

            {/* STUDIO LIGHTING RIG */}
            <ambientLight intensity={0.4} />

            {/* Main Key Light */}
            <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
            />

            {/* Soft Fill Light */}
            <directionalLight
                position={[-5, 4, -5]}
                intensity={0.4}
            />

            {/* Rim Highlight Light */}
            <spotLight
                position={[0, 10, 0]}
                intensity={0.8}
                angle={0.6}
                penumbra={1}
            />

            {/* DYNAMIC SCALE & PERFECT GROUNDING MODEL */}
            {modelUrl ? <ProductModel modelUrl={modelUrl} /> : null}

            {/* PBR ENVIRONMENT */}
            <Environment preset="studio" />

            {/* GROUNDED SHADOW (Perfect attachment at y = -0.01) */}
            <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.5}
                scale={10}
                blur={2.0}
                far={3}
                color="#000000"
            />

            {/* EXTENSIBLE CHILDREN */}
            {children}

            {/* CAMERA INTERACTION */}
            <OrbitControls
                enablePan={enablePan}
                enableZoom={enableZoom}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                minDistance={3.5}
                maxDistance={12}
                rotateSpeed={0.7}
                zoomSpeed={0.8}
                enableDamping
                dampingFactor={0.06}
                target={[0, 0.8, 0]} // Orbit center aligned with lookAt target
            />
        </Canvas>
    );
}