const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const GRID = 20;
const SIZE = canvas.width / GRID;
let snake, dir, food, score, highScore, running;

function init() {
  snake = [{x: 10, y: 10}];
  dir = 'right';
  spawnFood();
  score = 0;
  highScore = +localStorage.getItem('snakeBest') || 0;
  bestEl.textContent = highScore;
  scoreEl.textContent = 0;
  running = true;
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID)
    };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f0';
  snake.forEach((s, i) => {
    ctx.fillRect(s.x * SIZE, s.y * SIZE, SIZE - 1, SIZE - 1);
  });

  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * SIZE, food.y * SIZE, SIZE - 1, SIZE - 1);
}

function update() {
  const head = {x: snake[0].x, y: snake[0].y};

  switch (dir) {
    case 'up': head.y -= 1; break;
    case 'down': head.y += 1; break;
    case 'left': head.x -= 1; break;
    case 'right': head.x += 1; break;
  }

  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    running = false;
    setTimeout(() => {
      if (confirm('Game Over! Play again?')) init();
    }, 100);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      bestEl.textContent = highScore;
      localStorage.setItem('snakeBest', highScore);
    }
    spawnFood();
  } else {
    snake.pop();
  }
}

function loop() {
  if (!running) return;
  update();
  draw();
  setTimeout(() => requestAnimationFrame(loop), 1000 / 10);
}

document.addEventListener('keydown', e => {
  const key = e.key;
  if (key === 'ArrowUp' && dir !== 'down') dir = 'up';
  else if (key === 'ArrowDown' && dir !== 'up') dir = 'down';
  else if (key === 'ArrowLeft' && dir !== 'right') dir = 'left';
  else if (key === 'ArrowRight' && dir !== 'left') dir = 'right';
});

document.querySelectorAll('.controls button').forEach(btn => {
  btn.addEventListener('pointerdown', () => {
    const d = btn.dataset.dir;
    if ((d === 'up' && dir !== 'down') ||
        (d === 'down' && dir !== 'up') ||
        (d === 'left' && dir !== 'right') ||
        (d === 'right' && dir !== 'left')) {
      dir = d;
    }
  });
});

let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir !== 'left') dir = 'right';
    else if (dx < 0 && dir !== 'right') dir = 'left';
  } else {
    if (dy > 0 && dir !== 'up') dir = 'down';
    else if (dy < 0 && dir !== 'down') dir = 'up';
  }
});

init();
loop();