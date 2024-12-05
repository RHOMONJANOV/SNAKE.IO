const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');

const boardSize = 800; // Maydon hajmi (800x800 px)
const cellSize = 20;   // Bir segment hajmi
const borderSize = 20; // Chegaraning tashqi o'lchami
let snake = [{ x: 400, y: 400 }]; // Ilonning boshlang'ich joyi
let food = generateFood(45); // 5 ta ovqat yaratish
let direction = { x: 0, y: 0 }; // Ilonning yo'nalishi
let score = 0;
let speed = 100; // Harakat tezligi (millisekundlarda)
let bots = generateBots(10); // 10 ta bot yaratish

// Start tugmasini bosish orqali o'yinni boshlash
startButton.addEventListener('click', startGame);

// Ovoz elementi
const eatSound = document.createElement('audio');
eatSound.src = 'food-eat.mp3'; // Ovoz fayli manzili
document.body.appendChild(eatSound);

// O'yinni boshlash
function startGame() {
    score = 0;
    snake = [{ x: 400, y: 400 }];
    bots = generateBots(10);
    food = generateFood(30);
    direction = { x: 0, y: 0 };
    gameBoard.innerHTML = '';
    setInterval(moveSnake, speed);
    startButton.style.display = 'none'; // Start tugmasini yashirish
}

// Ovqatning joyini tasodifiy tanlash
function generateFood(count) {
    let foodArray = [];
    for (let i = 0; i < count; i++) {
        foodArray.push({
            x: Math.floor(Math.random() * ((boardSize - 2 * borderSize) / cellSize)) * cellSize + borderSize,
            y: Math.floor(Math.random() * ((boardSize - 2 * borderSize) / cellSize)) * cellSize + borderSize,
        });
    }
    return foodArray;
}

// Botlarni yaratish
function generateBots(count) {
    let botArray = [];
    for (let i = 0; i < count; i++) {
        botArray.push({
            x: Math.floor(Math.random() * ((boardSize - 2 * borderSize) / cellSize)) * cellSize + borderSize,
            y: Math.floor(Math.random() * ((boardSize - 2 * borderSize) / cellSize)) * cellSize + borderSize,
            direction: { x: 0, y: 0 },
            size: 1,  // Har bir bot boshlang'ichda 1 segmentli
        });
    }
    return botArray;
}

// Botlarni harakatlantirish
function moveBots() {
    bots.forEach(bot => {
        const closestFood = getClosestFood(bot);
        let bestDirection = { x: 0, y: 0 };

        // Ovqatga yaqinlashish
        if (Math.abs(closestFood.x - bot.x) > Math.abs(closestFood.y - bot.y)) {
            bestDirection = { x: closestFood.x > bot.x ? cellSize : -cellSize, y: 0 };
        } else {
            bestDirection = { x: 0, y: closestFood.y > bot.y ? cellSize : -cellSize };
        }

        bot.x += bestDirection.x;
        bot.y += bestDirection.y;
    });
}

// Eng yaqin ovqatni topish
function getClosestFood(bot) {
    let closest = food[0];
    let minDistance = Math.abs(bot.x - closest.x) + Math.abs(bot.y - closest.y);
    food.forEach(f => {
        const distance = Math.abs(bot.x - f.x) + Math.abs(bot.y - f.y);
        if (distance < minDistance) {
            closest = f;
            minDistance = distance;
        }
    });
    return closest;
}

// O'yin maydonini chizish
function draw() {
    gameBoard.innerHTML = '';

    // Chegarani chizish
    drawBorders();

    // Ilonni chizish
    snake.forEach(segment => {
        const snakeSegment = document.createElement('div');
        snakeSegment.style.left = `${segment.x}px`;
        snakeSegment.style.top = `${segment.y}px`;
        snakeSegment.classList.add('snake');
        gameBoard.appendChild(snakeSegment);
    });

    // Ovqatlarni chizish
    food.forEach(f => {
        const foodElement = document.createElement('div');
        foodElement.style.left = `${f.x}px`;
        foodElement.style.top = `${f.y}px`;
        foodElement.classList.add('food');
        gameBoard.appendChild(foodElement);
    });

    // Botlarni chizish
    bots.forEach(bot => {
        const botElement = document.createElement('div');
        botElement.style.left = `${bot.x}px`;
        botElement.style.top = `${bot.y}px`;
        botElement.style.width = `${cellSize * bot.size}px`;
        botElement.style.height = `${cellSize * bot.size}px`;
        botElement.classList.add('bot');
        gameBoard.appendChild(botElement);
    });
}

// Ilonni harakatlantirish
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Chegaraga urilish yoki o'ziga tegish
    if (
        head.x < borderSize || head.y < borderSize ||
        head.x >= boardSize - borderSize || head.y >= boardSize - borderSize ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        alert(`Game Over! Final score: ${score}`);
        resetGame();
        return;
    }

    // Botlarga urilish
    bots.forEach(bot => {
        if (head.x === bot.x && head.y === bot.y) {
            alert(`Game Over! You hit a bot! Final score: ${score}`);
            resetGame();
            return;
        }
    });

    // Ovqatni yeb qo'yish
    food.forEach((f, index) => {
        if (head.x === f.x && head.y === f.y) {
            score += 10;
            food.splice(index, 1);
            food.push(generateFood(1)[0]);
            eatSound.play(); // Ovozni ijro etish
            snake.push({ ...snake[snake.length - 1] });
        }
    });

    // Ilonning boshini qo'shish
    snake.unshift(head);

    // Ilon oxiridan bir segment olib tashlash
    snake.pop();

    draw();
    moveBots();
}

// Chegarani chizish
function drawBorders() {
    const borderTop = document.createElement('div');
    borderTop.classList.add('border');
    borderTop.style.width = `${boardSize}px`;
    borderTop.style.height = `${borderSize}px`;
    gameBoard.appendChild(borderTop);
}

// Klaviatura boshqaruvi
document.addEventListener('keydown', (event) => {
    if (event.key === 'W' && direction.y === 0) direction = { x: 0, y: -cellSize };
    if (event.key === 'S' && direction.y === 0) direction = { x: 0, y: cellSize };
    if (event.key === 'A' && direction.x === 0) direction = { x: -cellSize, y: 0 };
    if (event.key === 'D' && direction.x === 0) direction = { x: cellSize, y: 0 };
});
