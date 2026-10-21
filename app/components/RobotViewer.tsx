"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber"
import RobotModel from "./models/RobotModel";
import StudioLights from "./three/StudioLights";

export default function RobotViewer() {

    return (
      <section id="robot-viewer">

        <Canvas id="robot-canvas" 
        camera={{ position: [0, 2, 5], fov: 50, near: 0.1, far: 100 }}>
          <StudioLights />
          
          <RobotModel position={[0, -2, 0]} scale={0.7} />

          <OrbitControls />
        </Canvas>

      </section>  
    );
}