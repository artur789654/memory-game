import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import ballImage from "./images/ball.jpg";
import carImage from "./images/car.jpg";
import catImage from "./images/cat.jpg";
import ledImage from "./images/led.jpg";
import marioImage from "./images/mario.jpg";
import appleImage from "./images/apple.jpg";
import dragonImage from "./images/dragon.jpg";
import lionImage from "./images/lion.jpg";
import parrotImage from "./images/parrot.jpg";
import snakeImage from "./images/snake.jpg";
import questionImage from "./images/question.jpg";

import failSoundSrc from "./sounds/faile.mp3";
import flipcardSoundSrc from "./sounds/flipcard.mp3";
import matchSoundSrc from "./sounds/match.mp3";

const initialArrayCards = [
  { id: 1, img: ballImage },
  { id: 2, img: carImage },
  { id: 3, img: catImage },
  { id: 4, img: parrotImage },
  { id: 5, img: ledImage },
  { id: 6, img: marioImage },
  { id: 7, img: appleImage },
  { id: 8, img: dragonImage },
  { id: 9, img: lionImage },
  { id: 10, img: snakeImage },
];
const pairOfArrayCards = [...initialArrayCards, ...initialArrayCards];

const App = () => {
  const [selectedBoardSize, setSelectedBoardSize] = useState("3x4");
  const [boardSize, setBoardSize] = useState({ rows: 3, cols: 4 });
  const [arrayCards, setArrayCards] = useState([]);
  const [openedCards, setOpenedCards] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const flipcardSound = new Audio(flipcardSoundSrc);
  const failSound = useMemo(() => new Audio(failSoundSrc), []);
  const matchSound = useMemo(() => new Audio(matchSoundSrc), []);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isPlaying && gameTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameTime]);

  useEffect(() => {
    if (openedCards.length === 1 && matched.length === 0) {
      setIsPlaying(true);
    }
    if (matched.length === arrayCards.length / 2) {
      setIsPlaying(false);
    }
  }, [openedCards, matched, arrayCards.length]);

  const shuffle = (array) => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  useEffect(() => {
    const totalCards = boardSize.rows * boardSize.cols;
    const cardsNeeded = totalCards / 2;
    const shuffledCards = shuffle(
      [...initialArrayCards]
        .slice(0, cardsNeeded)
        .concat([...initialArrayCards].slice(0, cardsNeeded))
    );
    setArrayCards(shuffledCards);
  }, [boardSize]);

  const flipCard = (index) => () => {
    if (openedCards.includes(index) || matched.includes(arrayCards[index].id))
      return;
    flipcardSound.play(); 
    setOpenedCards((opened) => [...opened, index]);
  };

  useEffect(() => {
    if (openedCards.length < 2) return;
    const firstMatch = arrayCards[openedCards[0]];
    const secondMatch = arrayCards[openedCards[1]];

    if (secondMatch && firstMatch.id === secondMatch.id) {
      setMatched((matched) => [...matched, firstMatch.id]);
      matchSound.play();
    } else if (openedCards.length === 2) {
      failSound.play(); 
    }

    if (openedCards.length === 2) setTimeout(() => setOpenedCards([]), 1000);
    setMoves((prevMove) => prevMove + 1);
  }, [openedCards, arrayCards, failSound, matchSound]);

  const handleGameRestart = () => {
    setIsPlaying(false);
    setGameTime(0);

    const [rows, cols] = selectedBoardSize.split("x").map(Number);
    setOpenedCards([]);
    setMatched([]);
    setMoves(0);
    setArrayCards(shuffle([...pairOfArrayCards]));
    const totalCards = rows * cols;
    const cardsNeeded = totalCards / 2;
    const shuffledCards = shuffle(
      [...initialArrayCards]
        .slice(0, cardsNeeded)
        .concat([...initialArrayCards].slice(0, cardsNeeded))
    );
    setArrayCards(shuffledCards);
  };

  const gridStyle = {
    gridTemplateRows: `repeat(${boardSize.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${boardSize.cols}, 1fr)`,
  };

  return (
    <div className={`container`}>
      <div className="wrap">
      <p className="number-of-strokes">Зроблено ходів: {moves}</p>
      <p className="game-time">Час гри: {gameTime} секунд</p>
      <select
        className="board-size-selector"
        onChange={(e) => {
          setSelectedBoardSize(e.target.value);
          const [rows, cols] = e.target.value.split("x").map(Number);
          setBoardSize({ rows, cols });
        }}>
        <option value="3x4">3x4</option>
        <option value="4x4">4x4</option>
        <option value="4x5">4x5</option>
        <option value="5x4">5x4</option>
      </select>
      <button onClick={toggleTheme}>{theme==="light"? 'light': 'dark'}</button>
      </div>
      <div className="cards" style={gridStyle}>
        {arrayCards.map((item, index) => {
          let isFlipped = false;
          if (openedCards.includes(index) || matched.includes(item.id))
            isFlipped = true;
          return (
            <div
              key={index}
              className={`card ${isFlipped ? "flipped" : ""}`}
              onClick={flipCard(index)}>
              <div className="inner">
                <div className="front">
                  <img src={item.img} width="100" alt="card front" />
                </div>
                <div className="back">
                  <img src={questionImage} width="100" alt="card back" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="button-restart" onClick={handleGameRestart}>
        Почати заново
      </button>
    </div>
  );
};

export default App;
