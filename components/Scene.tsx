'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh } from 'three';

// --- Configuration ---
const NUM_POINTS = 96;
const SHAPE_INTERVAL = 3000;
const ANIMATION_LERP_FACTOR = 0.05; // Controls animation smoothness

// --- Position Calculation Functions ---
const getCubePositions = (): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const density = 4;
  const size = 12;
  const halfSize = size / 2;
  const createFace = (axis: 'x' | 'y' | 'z', sign: 1 | -1) => {
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const u = (i / (density - 1) - 0.5) * size;
        const v = (j / (density - 1) - 0.5) * size;
        if (axis === 'x') positions.push(new THREE.Vector3(sign * halfSize, u, v));
        else if (axis === 'y') positions.push(new THREE.Vector3(u, sign * halfSize, v));
        else positions.push(new THREE.Vector3(u, v, sign * halfSize));
      }
    }
  };
  createFace('x', 1); createFace('x', -1); createFace('y', 1); createFace('y', -1); createFace('z', 1); createFace('z', -1);
  return positions;
};
const getSpherePositions = (): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const radius = 8;
  const phi = Math.PI * (3.0 - Math.sqrt(5.0));
  for (let i = 0; i < NUM_POINTS; i++) {
    const y = 1 - (i / (NUM_POINTS - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    positions.push(new THREE.Vector3(x, y, z).multiplyScalar(radius));
  }
  return positions;
};
const getPyramidPositions = (): THREE.Vector3[] => {
    const positions: THREE.Vector3[] = [];
    const height = 10;
    const baseSize = 10;
    const halfBase = baseSize / 2;
    const pointsPerFace = Math.floor(NUM_POINTS / 5);
    for (let i = 0; i < pointsPerFace; i++) {
        positions.push(new THREE.Vector3((Math.random() - 0.5) * baseSize, -height / 2, (Math.random() - 0.5) * baseSize));
    }
    const apex = new THREE.Vector3(0, height / 2, 0);
    const corners = [
        new THREE.Vector3(-halfBase, -height / 2, -halfBase), new THREE.Vector3(halfBase, -height / 2, -halfBase),
        new THREE.Vector3(halfBase, -height / 2, halfBase), new THREE.Vector3(-halfBase, -height / 2, halfBase),
    ];
    for (let i = 0; i < 4; i++) {
        const v1 = corners[i];
        const v2 = corners[(i + 1) % 4];
        for (let j = 0; j < pointsPerFace; j++) {
            const r1 = Math.random();
            const r2 = Math.random();
            const pos = new THREE.Vector3().addScaledVector(v1, 1 - Math.sqrt(r1)).addScaledVector(v2, Math.sqrt(r1) * (1 - r2)).addScaledVector(apex, Math.sqrt(r1) * r2);
            positions.push(pos);
        }
    }
    return positions;
};
const getTorusPositions = (): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const majorRadius = 7;
  const minorRadius = 3;
  for (let i = 0; i < NUM_POINTS; i++) {
    const u = (i % (NUM_POINTS / 6)) * ((2 * Math.PI) / (NUM_POINTS/6));
    const v = Math.floor(i / (NUM_POINTS / 6)) * ((2*Math.PI) / 6);
    const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
    const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
    const z = minorRadius * Math.sin(v);
    positions.push(new THREE.Vector3(x, y, z));
  }
  return positions;
};
const shapeFunctions = [getCubePositions, getSpherePositions, getPyramidPositions, getTorusPositions];

// --- AnimatedText Component using useFrame ---
function AnimatedText({ targetPosition }: { targetPosition: THREE.Vector3 }) {
  const meshRef = useRef<Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPosition, ANIMATION_LERP_FACTOR);
    }
  });

  return (
    <Text3D
        ref={meshRef}
        size={0.7}
        height={0.2}
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.02}
        curveSegments={12}
        font="/Maglony.typeface.json"
        castShadow
    >
        BB
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3}/>
    </Text3D>
  );
}

// --- Main Scene Component ---
export default function Scene() {
  const [shapeIndex, setShapeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShapeIndex((prevIndex) => (prevIndex + 1) % shapeFunctions.length);
    }, SHAPE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const targetPositions = useMemo(() => shapeFunctions[shapeIndex](), [shapeIndex]);

  return (
    <Canvas style={{ background: '#0a0a0a' }} shadows>
      <PerspectiveCamera makeDefault position={[25, 15, 25]} fov={60} />
      <OrbitControls enableDamping dampingFactor={0.1} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 20, 10]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      {Array.from({ length: NUM_POINTS }).map((_, i) => (
        <AnimatedText key={i} targetPosition={targetPositions[i] || new THREE.Vector3(0,0,0)} />
      ))}
    </Canvas>
  );
}