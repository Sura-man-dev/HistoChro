import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function EventMarkers() {
  const group = useRef(null);
  const markers = useRef(null);
  const points = [[-1.45, 0.25, 0], [-0.72, -0.62, 0.2], [0.08, 0.72, -0.1], [0.84, 0.16, 0.2], [1.42, -0.4, -0.2], [0.4, -0.85, 0.1]];
  useFrame(({ pointer, clock }) => {
    if (!group.current) return;
    group.current.rotation.y = pointer.x * 0.11;
    group.current.rotation.x = pointer.y * 0.08;
    if (markers.current) markers.current.children.forEach((marker, index) => {
      marker.position.y = marker.userData.baseY + Math.sin(clock.elapsedTime * 0.85 + index) * 0.05;
    });
  });
  return (
    <group ref={group}>
      <group ref={markers}>
        {points.map((position, index) => (
          <mesh key={index} position={position} userData={{ baseY: position[1] }}>
            <sphereGeometry args={[index % 2 === 0 ? 0.045 : 0.03, 12, 12]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#fff0c5" : "#d4a85e"} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      <mesh position={[-0.72, -0.62, 0.2]} scale={[0.18, 0.004, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#e4bc71" transparent opacity={0.38} />
      </mesh>
      <mesh position={[0.08, 0.72, -0.1]} scale={[0.24, 0.004, 1]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#e4bc71" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

function StarField() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (Math.random() - 0.5) * 16;
      positions[index + 1] = (Math.random() - 0.5) * 10;
      positions[index + 2] = -2 - Math.random() * 7;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return result;
  }, []);
  return <points geometry={geometry}><pointsMaterial color="#f4d58d" size={0.018} transparent opacity={0.55} sizeAttenuation /></points>;
}

export default function HeroScene() {
  return (
    <div className="hero__three" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 42 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.8} />
        <EventMarkers />
        <StarField />
      </Canvas>
    </div>
  );
}
