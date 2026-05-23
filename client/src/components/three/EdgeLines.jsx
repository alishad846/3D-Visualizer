import React from "react";
import { Edges } from "@react-three/drei";

export default function EdgeLines() {
    return (
        <Edges
            threshold={15}
            color="#222"
        />
    );
}