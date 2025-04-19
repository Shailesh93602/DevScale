import React from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';

const ParticlesBackground: React.FC = () => {
  // Customizes the particles for a modern, techy look
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: 'transparent' },
        fpsLimit: 60,
        particles: {
          number: {
            value: 45,
            density: { enable: true, area: 900 },
          },
          color: { value: ['#6C63FF', '#00B4D8', '#FF6B6B', '#FFD166'] },
          shape: {
            type: ['circle', 'triangle', 'polygon'],
            polygon: { nb_sides: 5 },
          },
          opacity: {
            value: 0.7,
            anim: { enable: true, speed: 0.6, opacity_min: 0.3, sync: false },
          },
          size: {
            value: { min: 2, max: 6 },
            anim: { enable: true, speed: 2, size_min: 1, sync: false },
          },
          links: {
            enable: true,
            distance: 120,
            color: '#a0aec0',
            opacity: 0.4,
            width: 1.2,
          },
          move: {
            enable: true,
            speed: 1.2,
            direction: 'none',
            random: false,
            straight: false,
            outModes: { default: 'out' },
            attract: { enable: false },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
            resize: true,
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticlesBackground;
