import "@google/model-viewer";

export default function ARViewer() {

  return (

    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050816",
      }}
    >

      <model-viewer

        src="/models/headphone.glb"

        ar

        ar-modes="scene-viewer quick-look webxr"

        camera-controls

        auto-rotate

        shadow-intensity="1"

        exposure="1"

        environment-image="neutral"

        style={{
          width: "100%",
          height: "100%",
        }}

      >

        <button
          slot="ar-button"
          style={{

            position: "absolute",

            bottom: "30px",
            left: "50%",

            transform: "translateX(-50%)",

            padding: "16px 32px",

            borderRadius: "16px",

            border: "none",

            background: "#22d3ee",

            color: "black",

            fontWeight: "700",

            fontSize: "18px",

            cursor: "pointer",

            boxShadow: "0 0 40px rgba(34,211,238,0.35)",
          }}
        >

          View In Your Space

        </button>

      </model-viewer>

    </div>
  );
}