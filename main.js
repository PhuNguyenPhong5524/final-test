let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, ""];
let gameState = "start"; // start -> playing -> win -> reset
let currentIndex = 11; // vị trí ô đen
let steps = 0;
let timer = null; // ID của setInterval
let time = 0;

const COLS = 4; // số cột (ở đây là 4)
const boxGame = document.querySelector(".showBoxGame");
const btn = document.querySelector(".btn");
const result = document.querySelector(".result");
const boxTime = document.querySelector(".time");


//
const randomBox = (array, movesCount = 100) => {
  for (let i = 0; i < movesCount; i++) {
    const moves = [-1, 1, -COLS, COLS]; 
    const valid = moves
      .map(m => {
        const newIndex = currentIndex + m;
        // kiểm tra trong phạm vi
        if (newIndex < 0 || newIndex >= array.length) return null;
        if (m === -1 && currentIndex % COLS === 0) return null; // đang ở cột 0 thì không thể qua trái
        if (m === 1 && currentIndex % COLS === COLS - 1) return null; // đang ở cột cuối không thể qua phải
        return newIndex;
      })
      .filter(i => i !== null);

    const randomMove = valid[Math.floor(Math.random() * valid.length)];
    // 
    [array[currentIndex], array[randomMove]] = [array[randomMove], array[currentIndex]];
    currentIndex = randomMove;
  }
}

const showBoxGame = () => {
  const colors = [
    "green", "red", "blue", "purple",
    "pink", "yellow", "indigo", "gray",
    "emerald", "amber", "lime"
  ];
  const textColors = colors.slice(); 

  boxGame.innerHTML = tiles
    .map(number => {
      if (number === "") {
        return `<div class="w-full h-[160px] rounded-[10px] border bg-black"></div>`;
      }
      const color = colors[(number - 1) % colors.length];
      return `
        <div 
          class="
            bg-${color}-100 w-full h-[160px] rounded-[10px] border border-1 border-${color}-300
            flex items-center justify-center transform transition duration-300 ease-in-out cursor-pointer
            hover:border-${color}-500 hover:bg-${color}-500
          "
        >
          <strong class="text-${textColors[(number - 1) % textColors.length]}-300">${number}</strong>
        </div>
      `;
    }).join("");
}
randomBox(tiles, 1000);
showBoxGame();


function startTimer() {
  if (timer !== null) return; 
  timer = setInterval(() => {
    time++;
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    boxTime.textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

const history = [];
function checkWin() {
  const win = [1,2,3,4,5,6,7,8,9,10,11,""];
  if (JSON.stringify(tiles) === JSON.stringify(win)) {
    stopTimer();
    result.textContent = "YOU WIN!";
    gameState = "win";
    history.push(
      {
        id: history.length + 1, 
        steps: steps,
        time: time
      }
    );
    localStorage.setItem("history", JSON.stringify(history));
    return true;
  }
  return false;
}

// 
document.addEventListener("keydown", (e) => {
  if (gameState !== "playing") return;

  const key = e.key.toLowerCase();
  let newIndex = -1;

  // newIndex là vị trí mới của ô đen
  if (key === "a" || key === "arrowleft") {
    // trái: ô trống phải NOT ở cột 0; mục tiêu là currentIndex - 1 (ô bên trái)
    if (currentIndex % COLS !== 0) newIndex = currentIndex - 1;
  }
  if (key === "d" || key === "arrowright") {
    // phải: ô trống phải NOT ở cột cuối; mục tiêu currentIndex + 1
    if (currentIndex % COLS !== COLS - 1) newIndex = currentIndex + 1;
  }
  if (key === "w" || key === "arrowup") {
    // lên: currentIndex - COLS (nếu >=0)
    if (currentIndex - COLS >= 0) newIndex = currentIndex - COLS;
  }
  if (key === "s" || key === "arrowdown") {
    // xuống: currentIndex + COLS (nếu < length)
    if (currentIndex + COLS < tiles.length) newIndex = currentIndex + COLS;
  }

  if (newIndex === -1) return; // phím không hợp lệ hoặc bị chặn vì biên

  // swap: ô trống và ô mục tiêu
  [tiles[currentIndex], tiles[newIndex]] = [tiles[newIndex], tiles[currentIndex]];
  currentIndex = newIndex;
  steps++;
  showBoxGame();
  checkWin();
});


btn.addEventListener("click", () => {
  switch (gameState) {
    case "start":
      // reset trạng thái
      tiles = [1,2,3,4,5,6,7,8,9,10,11,""];
      currentIndex = 11;
      // shuffle
      randomBox(tiles, 1000);

      steps = 0;

      // reset time (time là số giây)
      stopTimer();
      time = 0;
      boxTime.textContent = "00:00";
      boxTime.classList.add("text-red-600");
      boxTime.classList.add("animate-pulse");

      result.textContent = "";

      startTimer();

      btn.textContent = "Kết thúc";
      btn.classList.remove("bg-green-600");
      btn.classList.add("bg-red-600");

      gameState = "playing";
      showBoxGame();
      break;

    case "win":
      // khi đã win → chuyển sang reset view
      tiles = [1,2,3,4,5,6,7,8,9,10,11,""];
      currentIndex = 11;

      result.textContent = "";
      boxTime.textContent = "00:00";

      btn.textContent = "Chơi lại";
      btn.classList.remove("bg-red-600");
      btn.classList.add("bg-yellow-500");

      gameState = "reset";
      showBoxGame();
      break;

    case "reset":
      btn.textContent = "Bắt đầu";
      btn.classList.remove("bg-yellow-500");
      btn.classList.add("bg-green-600");

      gameState = "start";
      break;

    default:
      break;
  }
});


// Hiển thị table lịch sử chơi
const showTbody = document.querySelector(".showTbody");
document.addEventListener("DOMContentLoaded", () => {
  const history = JSON.parse(localStorage.getItem("history"));
  showTbody.innerHTML = history
    .map((hs) =>{
      const m = String(Math.floor(hs.time / 60)).padStart(2, "0");
      const s = String(hs.time % 60).padStart(2, "0");
      return `
        <tr>
            <td class="text-center py-[10px]">${hs.id}</td>
            <td class="text-center py-[10px]">${hs.steps}</td>
            <td class="text-center py-[10px]">${m}:${s}</td>
        </tr>
      `
    })
})