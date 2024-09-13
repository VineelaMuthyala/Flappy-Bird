import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const FlappyBird = () => {
  const [birdY, setBirdY] = useState(200);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const birdRef = useRef(null);
  const gameIntervalRef = useRef(null);

  const gravity = 0.6;
  const jump = -10;
  const pipeWidth = 100;
  const pipeGap = 220;
  const pipeSpeed = 2;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        if (gameOver) {
          resetGame();
        } else if (gameStarted) {
          setBirdVelocity(jump);
        }
      } else if (e.key === 'Enter') {
        if (!gameStarted) {
          setGameStarted(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameStarted, jump]);

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
          if (!pipe.passed && pipe.x + pipeWidth < 50) {
            newScore += 1;
            return { ...pipe, passed: true };
          }
          return pipe;
        });

        setScore(newScore);
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
          newPipes.push({
            x: window.innerWidth,
            gapY: middleY - pipeGap / 2 + Math.random() * 50,
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

  const resetGame = () => {
    setBirdY(200);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="game">
      {!gameStarted && !gameOver && (
        <div className="instructions">
          <div>Press Enter to start the Game</div>
          <div>Press Space bar for the bird to fly</div>
        </div>
      )}
      <div className="background" />
      <div className="ground" />
      <div
        className={`bird ${gameOver ? 'bird-upside-down' : ''}`}
        ref={birdRef}
        style={{ top: `${birdY}px` }}
      />
      {pipes.map((pipe, index) => (
        <React.Fragment key={index}>
          <div className="pipe" style={{ left: `${pipe.x}px`, height: `${pipe.gapY}px` }} />
          <div className="pipe-bottom" style={{ left: `${pipe.x}px`, height: `${window.innerHeight - (pipe.gapY + pipeGap)}px`, top: `${pipe.gapY + pipeGap}px` }} />
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
