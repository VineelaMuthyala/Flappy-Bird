import React, { useEffect, useRef } from 'react';
import birdFlySoundFile from '../FlappyBird/sounds/bird-fly.mp3';

const TestAudio = () => {
  const birdFlySoundRef = useRef(new Audio(birdFlySoundFile));

  useEffect(() => {
    // Attempt to play the sound when the component mounts
    birdFlySoundRef.current.play().catch((error) => console.error("Failed to play sound:", error));
  }, []);

  return (
    <div>
      <button onClick={() => birdFlySoundRef.current.play().catch((error) => console.error("Failed to play sound:", error))}>
        Play Bird Fly Sound
      </button>
    </div>
  );
};

export default TestAudio;
