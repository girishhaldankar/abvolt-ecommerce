// HeroSection3D.tsx
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Html } from "@react-three/drei";
import droneGLB from "../assets/droneAni.glb";

function DroneModel() {
  const group = useRef<any>();
  const { scene }: any = useGLTF(droneGLB);

  // Extract parts for explosion
  const parts: any[] = scene.children;

  // Animate rotation + explosion
  useFrame(({ clock }) => {
    if (!group.current) return;

    group.current.rotation.y += 0.002;

    // Smooth explosion/assembly
    const t = clock.getElapsedTime();
    const explode = Math.sin(t / 2) * 0.5; // -0.5 to 0.5

    parts.forEach((part: any, idx: number) => {
      const offset = (idx - parts.length / 2) * explode;
      part.position.x = offset;
      part.position.y = offset;
      part.position.z = offset;
    });
  });

  return (
    <group ref={group} scale={[2.5, 2.5, 2.5]}>
      {parts.map((part: any, idx: number) => (
        <primitive key={idx} object={part} />
      ))}
    </group>
  );
}

export const HeroSection3D = () => {
  return (
    <div className="w-full h-[80vh] bg-gray-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 1.2, 3], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<Html center>Loading 3D Model...</Html>}>
          <Center>
            <DroneModel />
          </Center>
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
};
