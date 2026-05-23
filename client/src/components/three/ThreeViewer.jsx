import React, { Suspense } from "react";

import { Canvas } from "@react-three/fiber";

import {
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";

import { TOUCH } from "three";

import ModelLoader from "./ModelLoader";

export default function ThreeViewer() {
  const openAR = () => {
    window.open("/ar", "_self");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        background: "#000",

        display: "flex",
        flexDirection: "column",

        overflow: "hidden",
      }}
    >
      {/* VIEWER */}
      <div
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          shadows
          gl={{
            antialias: true,
            alpha: false,
          }}
          camera={{
            position: [0, 1, 5],
            fov: 45,
            near: 0.01,
            far: 1000,
          }}
        >
          {/* LIGHTS */}
          <ambientLight intensity={1.3} />

          <directionalLight
            position={[5, 5, 5]}
            intensity={2}
            castShadow
          />

          <directionalLight
            position={[-5, 3, -5]}
            intensity={1}
          />

          {/* ENVIRONMENT */}
          <Environment preset="city" />

          {/* MODEL */}
          <Suspense fallback={null}>
            <ModelLoader />
          </Suspense>

          {/* SHADOWS */}
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          {/* CONTROLS */}
          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            enablePan={false}

            enableDamping={true}
            dampingFactor={0.08}

            rotateSpeed={0.7}
            zoomSpeed={1.5}

            minDistance={0.5}
            maxDistance={20}

            touches={{
              ONE: TOUCH.ROTATE,
              TWO: TOUCH.DOLLY_ROTATE,
            }}
          />
        </Canvas>
      </div>

      {/* AR BUTTON */}
      <div
        style={{
          width: "100%",
          padding: "18px",
          background: "#111",

          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={openAR}
          style={{
            padding: "14px 30px",

            borderRadius: "14px",
            border: "none",

            background: "white",
            color: "black",

            fontSize: "16px",
            fontWeight: "700",

            cursor: "pointer",
          }}
        >
          View in AR
        </button>
      </div>
    </div>
  );
}