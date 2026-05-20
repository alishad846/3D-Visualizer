export default function ARButton() {
    return (
        <button
            onClick={() => {
                window.location.href = "/ar";
            }}
            style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                padding: "14px 24px",
                background: "white",
                color: "black",
                border: "none",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 1000,
            }}
        >
            View in AR
        </button>
    );
}