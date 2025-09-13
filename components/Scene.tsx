'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// --- Configuration ---
const NUM_POINTS = 96; // Total text elements. Must be a multiple of 6 for the cube.
const SHAPE_INTERVAL = 3000; // 3 seconds per shape
const ANIMATION_DURATION = 1.5; // Transition time

// --- Position Calculation Functions ---

// 1. Cube Positions
const getCubePositions = (): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const density = 4; // Results in 4*4=16 points per face
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
  createFace('x', 1); createFace('x', -1);
  createFace('y', 1); createFace('y', -1);
  createFace('z', 1); createFace('z', -1);
  return positions;
};

// 2. Sphere Positions
const getSpherePositions = (): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const radius = 8;
  const phi = Math.PI * (3.0 - Math.sqrt(5.0)); // Golden angle
  for (let i = 0; i < NUM_POINTS; i++) {
    const y = 1 - (i / (NUM_POINTS - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    positions.push(new THREE.Vector3(x, y, z).multiplyScalar(radius));
  }
  return positions;
};

// 3. Pyramid Positions
const getPyramidPositions = (): THREE.Vector3[] => {
    const positions: THREE.Vector3[] = [];
    const height = 10;
    const baseSize = 10;
    const halfBase = baseSize / 2;
    const pointsPerFace = Math.floor(NUM_POINTS / 5); // 4 sides + 1 base

    // Base face (on y = -height/2)
    for (let i = 0; i < pointsPerFace; i++) {
        positions.push(new THREE.Vector3(
            (Math.random() - 0.5) * baseSize,
            -height / 2,
            (Math.random() - 0.5) * baseSize
        ));
    }

    // 4 triangular side faces
    const apex = new THREE.Vector3(0, height / 2, 0);
    const corners = [
        new THREE.Vector3(-halfBase, -height / 2, -halfBase),
        new THREE.Vector3(halfBase, -height / 2, -halfBase),
        new THREE.Vector3(halfBase, -height / 2, halfBase),
        new THREE.Vector3(-halfBase, -height / 2, halfBase),
    ];

    for (let i = 0; i < 4; i++) {
        const v1 = corners[i];
        const v2 = corners[(i + 1) % 4];
        for (let j = 0; j < pointsPerFace; j++) {
            const r1 = Math.random();
            const r2 = Math.random();
            const pos = new THREE.Vector3()
                .addScaledVector(v1, 1 - Math.sqrt(r1))
                .addScaledVector(v2, Math.sqrt(r1) * (1 - r2))
                .addScaledVector(apex, Math.sqrt(r1) * r2);
            positions.push(pos);
        }
    }
    return positions;
};

// 4. Torus (Donut) Positions
const getTorusPositions = (): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const majorRadius = 7;
  const minorRadius = 3;
  for (let i = 0; i < NUM_POINTS; i++) {
    const u = (i % (NUM_POINTS / 6)) * ( (2 * Math.PI) / (NUM_POINTS/6) );
    const v = Math.floor(i / (NUM_POINTS / 6)) * ( (2*Math.PI) / 6);
    const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
    const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
    const z = minorRadius * Math.sin(v);
    positions.push(new THREE.Vector3(x, y, z));
  }
  return positions;
};


const shapeFunctions = [getCubePositions, getSpherePositions, getPyramidPositions, getTorusPositions];

// --- The Main Scene Component ---
export default function Scene() {
  const [shapeIndex, setShapeIndex] = useState(0);

  // Effect to cycle through shapes
  useEffect(() => {
    const interval = setInterval(() => {
      setShapeIndex((prevIndex) => (prevIndex + 1) % shapeFunctions.length);
    }, SHAPE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Calculate target positions based on the current shape
  const targetPositions = useMemo(() => {
    return shapeFunctions[shapeIndex]();
  }, [shapeIndex]);

  return (
    <Canvas style={{ background: '#0a0a0a' }} shadows>
      <PerspectiveCamera makeDefault position={[25, 15, 25]} fov={60} />
      <OrbitControls enableDamping dampingFactor={0.1} />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[15, 20, 10]} 
        intensity={2.5}
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {Array.from({ length: NUM_POINTS }).map((_, i) => {
        const target = targetPositions[i] || new THREE.Vector3(0, 0, 0);
        return (
            <motion.group
            key={i}
            animate={{
                x: target.x,
                y: target.y,
                z: target.z,
            }}
            transition={{
                duration: ANIMATION_DURATION,
                ease: "easeInOut",
                type: "spring",
                stiffness: 50,
                damping: 15,
            }}
            >
            <Text3D
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
            </motion.group>
        );
      })}
    </Canvas>
  );
}