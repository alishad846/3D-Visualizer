import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Vector3 } from "three";
import ProductModel from "../model/ProductModel";

function AdaptiveCamera({ defaultDistanceRef }) {
    const { size, camera } = useThree();

    useEffect(() => {
        const aspect = size.width / size.height;
        const radius = 1.8;
        const fovRad = (camera.fov * Math.PI) / 180;

        let distance;
        if (aspect < 1) {
            const hFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
            distance = radius / Math.sin(hFovRad / 2);
        } else {
            distance = radius / Math.sin(fovRad / 2);
        }

        const padding = 1.7;
        const finalDistance = Math.min(Math.max(distance * padding, 4.5), 14);

        camera.position.set(0, 0.8, finalDistance);
        camera.lookAt(0, 0.8, 0);
        camera.updateProjectionMatrix();

        // Store the actual computed default distance so ZoomBridge
        // can use it as the 100% reference point
        if (defaultDistanceRef) {
            defaultDistanceRef.current = finalDistance;
        }
    }, [size.width, size.height, camera, defaultDistanceRef]);

    return null;
}

function ZoomBridge({ controlsRef, cameraRef, defaultDistanceRef, onZoomPercentChange }) {
    const { camera } = useThree();
    const lastPercentRef = useRef(null);

    useEffect(() => {
        cameraRef.current = camera;
    }, [camera, cameraRef]);

    useFrame(() => {
        const controls = controlsRef.current;
        if (!controls || !cameraRef.current) return;

        const distance = cameraRef.current.position.distanceTo(controls.target);

        // Use the actual default distance as the 100% reference.
        // Fall back to 8 until AdaptiveCamera has run and stored the value.
        const defaultDistance = defaultDistanceRef?.current ?? 8;

        // defaultDistance = 100%
        // zooming in  (distance < default) → percent > 100
        // zooming out (distance > default) → percent < 100
        const percent = Math.round((defaultDistance / distance) * 100);
        const clamped = Math.min(1000, Math.max(1, percent));

        if (lastPercentRef.current !== clamped) {
            lastPercentRef.current = clamped;
            onZoomPercentChange?.(clamped);
        }
    });

    return null;
}

const ProductCanvas = forwardRef(function ProductCanvas({
    modelUrl,
    autoRotate = false,
    enableZoom = true,
    enablePan = false,
    onZoomPercentChange,
    children
}, ref) {
    const controlsRef = useRef(null);
    const cameraRef = useRef(null);
    const defaultDistanceRef = useRef(8); // updated by AdaptiveCamera on first render
    const minDistance = 3.5;
    const maxDistance = 60;

    const applyDistance = (nextDistance) => {
        const controls = controlsRef.current;
        const camera = cameraRef.current;
        if (!controls || !camera) return;

        const target = controls.target.clone();
        const direction = new Vector3()
            .subVectors(camera.position, target)
            .normalize();
        const clamped = Math.min(maxDistance, Math.max(minDistance, nextDistance));
        camera.position.copy(target.add(direction.multiplyScalar(clamped)));
        controls.update();
    };

    const getDistance = () => {
        const controls = controlsRef.current;
        const camera = cameraRef.current;
        if (!controls || !camera) return null;
        return camera.position.distanceTo(controls.target);
    };

    useImperativeHandle(ref, () => ({
        zoomIn(step = 0.8) {
            const current = getDistance();
            if (current === null) return;
            applyDistance(current - step);
        },
        zoomOut(step = 0.8) {
            const current = getDistance();
            if (current === null) return;
            applyDistance(current + step);
        },
    }), []);

    return (
        <Canvas
            dpr={[1, 1.5]}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            }}
            camera={{
                fov: 40,
                near: 0.05,
                far: 200
            }}
            style={{ width: "100%", height: "100%" }}
        >
            <AdaptiveCamera defaultDistanceRef={defaultDistanceRef} />
            <ZoomBridge
                controlsRef={controlsRef}
                cameraRef={cameraRef}
                defaultDistanceRef={defaultDistanceRef}
                onZoomPercentChange={onZoomPercentChange}
            />

            {/* STUDIO LIGHTING RIG */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
            />
            <directionalLight
                position={[-5, 4, -5]}
                intensity={0.4}
            />
            <spotLight
                position={[0, 10, 0]}
                intensity={0.8}
                angle={0.6}
                penumbra={1}
            />

            {modelUrl ? <ProductModel modelUrl={modelUrl} /> : null}

            <Environment preset="studio" />

            <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.5}
                scale={10}
                blur={2.0}
                far={3}
                color="#000000"
            />

            {children}

            <OrbitControls
                ref={controlsRef}
                enablePan={enablePan}
                enableZoom={enableZoom}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                minDistance={minDistance}
                maxDistance={maxDistance}
                rotateSpeed={0.7}
                zoomSpeed={0.8}
                enableDamping
                dampingFactor={0.06}
                target={[0, 0.8, 0]}
            />
        </Canvas>
    );
});

export default ProductCanvas;