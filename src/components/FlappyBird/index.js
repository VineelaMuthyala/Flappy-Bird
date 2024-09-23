import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import birdFlySoundFile from './sounds/bird-fly.mp3';
import gameOverSoundFile from './sounds/game-over.mp3';

const FlappyBird = () => {
  const [birdY, setBirdY] = useState(200);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const birdRef = useRef(null);
  const birdFlySoundRef = useRef(new Audio(birdFlySoundFile));
  const gameOverSoundRef = useRef(new Audio(gameOverSoundFile));
  const gameIntervalRef = useRef(null);

  useEffect(() => {
    birdFlySoundRef.current.load();
  }, []);
  

  const playBirdFlySound = () => {
    const birdFlySound = birdFlySoundRef.current;
    
    // Check if the sound is already playing
    if (birdFlySound.paused) {
      birdFlySound.currentTime = 0; // Reset to the beginning
      birdFlySound.play().catch((error) => {
        console.error('Audio play error:', error);
      });
    }
  };
  

  const stopBirdFlySound = () => {
    const birdFlySound = birdFlySoundRef.current;
    birdFlySound.pause();
    birdFlySound.currentTime = 0;
  };

  const gravity = 0.6;
  const jump = -10;
  const pipeWidth = 100;
  const pipeGap = 220;
  const pipeSpeed = 2;

  const startGame = useCallback(() => {
    setGameStarted(true);
    playBirdFlySound();
  }, []);

  const resetGame = useCallback(() => {
    setBirdY(200);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    stopBirdFlySound();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        if (gameOver) {
          resetGame();
        } else if (gameStarted) {
          setBirdVelocity(jump);
        }
      } else if (e.key === 'Enter' && !gameStarted) {
        startGame();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameStarted, jump, resetGame, startGame]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const checkCollision = () => {
      const birdRect = birdRef.current.getBoundingClientRect();

      for (const pipe of pipes) {
        const pipeTopRect = {
          left: pipe.x,
          top: 0,
          right: pipe.x + pipeWidth,
          bottom: pipe.gapY,
        };

        const pipeBottomRect = {
          left: pipe.x,
          top: pipe.gapY + pipeGap,
          right: pipe.x + pipeWidth,
          bottom: window.innerHeight,
        };

        if (
          (birdRect.right > pipeTopRect.left &&
            birdRect.left < pipeTopRect.right &&
            (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)) ||
          birdY > window.innerHeight - 100
        ) {
          setGameOver(true);
          stopBirdFlySound();
          gameOverSoundRef.current.play();

          if (score > highScore) {
            setHighScore(score);
          }
        }
      }
    };

    const checkScore = () => {
      setPipes((prevPipes) => {
        let newScore = score;

        const updatedPipes = prevPipes.map((pipe) => {
          if (!pipe.passed && pipe.x + pipeWidth < window.innerWidth / 2) {
            newScore += 1; // Increment the score when the bird passes the pipe
            return { ...pipe, passed: true }; // Mark the pipe as passed
          }
          return pipe;
        });

        if (newScore !== score) {
          setScore(newScore); // Update the score only if it changes
        }

        return updatedPipes;
      });
    };

    gameIntervalRef.current = setInterval(() => {
      setBirdY((prev) => prev + birdVelocity);
      setBirdVelocity((prev) => prev + gravity);

      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - pipeSpeed,
          }))
          .filter((pipe) => pipe.x + pipeWidth > 0);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < window.innerWidth - 300) {
          const middleY = window.innerHeight / 2;
          const randomOffset = (Math.random() - 0.5) * 150;
          newPipes.push({
            x: window.innerWidth,
            gapY: middleY + randomOffset,
            passed: false,
          });
        }

        return newPipes;
      });

      checkCollision();
      checkScore();
    }, 20);

    return () => clearInterval(gameIntervalRef.current);
  }, [birdVelocity, gameStarted, gameOver, pipes, score, highScore, birdY]);

  return (
    <div className="game">
      <div className="background" />
      <div className="ground" />
      <div
        className={`bird ${gameOver ? 'bird-upside-down' : ''}`}
        ref={birdRef}
        style={{
          top: `${birdY}px`,
          left: `50%`,
          transform: 'translateX(-50%)',
        }}
      />

      {pipes.map((pipe, index) => (
        <React.Fragment key={index}>
          <div className="pipe" style={{ left: `${pipe.x}px`, height: `${pipe.gapY}px` }} />
          <div
            className="pipe-bottom"
            style={{
              left: `${pipe.x}px`,
              height: `${window.innerHeight - (pipe.gapY + pipeGap)}px`,
              top: `${pipe.gapY + pipeGap}px`,
            }}
          />
        </React.Fragment>
      ))}

      {gameOver && (
        <div className="game-over">
          <div>Game Over! Press Space to restart.</div>
          <div className="score">Score: {score}</div>
          <div>High Score: {highScore}</div>
        </div>
      )}
      {!gameStarted && !gameOver && (
        <div className="instructions">
          <div>Press Enter to start the Game</div>
          <div>Press Space bar for the bird to fly</div>
        </div>
      )}

      <div className="score-container">
        <div className="score-top">{score}</div>
      </div>
    </div>
  );
};

export default FlappyBird;
