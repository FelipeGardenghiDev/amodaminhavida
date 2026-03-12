const startButton = document.getElementById("startButton");
const gameContainer = document.getElementById("gameContainer");
const spotifyToggle = document.getElementById("spotifyToggle");
const spotifyPlayer = document.querySelector(".spotify-player-floating");

if (spotifyToggle && spotifyPlayer) {
    spotifyToggle.addEventListener("click", () => {
        spotifyPlayer.classList.toggle("minimized");
        const isExpanded = !spotifyPlayer.classList.contains("minimized");
        spotifyToggle.setAttribute("aria-expanded", String(isExpanded));
        spotifyToggle.textContent = isExpanded ? "Minimizar Spotify" : "Abrir Spotify";
    });
}

startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    gameContainer.style.display = "block";

    document.getElementById("gameCanvas")?.remove();
    const canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";
    const touchControls = document.getElementById("touchControls");
    gameContainer.insertBefore(canvas, touchControls);

    startGame();
});

function startGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 350;

    const playerImg = new Image();
    playerImg.src = "./img/player.png";
    const obstacleImg = new Image();
    obstacleImg.src = "./img/obstacle.png";

    let player = { x: 175, y: 300, width: 50, height: 50, speed: 5 };
    let obstacles = [];
    let gameOver = false;
    let score = 0;
    let frameId = null;
    let spawnIntervalId = null;
    let scoreIntervalId = null;
    let difficultyIntervalId = null;
    let obstacleSpeed = 3;

    const storedHigh = parseInt(localStorage.getItem("powderHighScore") || "0", 10);
    let highScore = storedHigh;

    function updateScoreDisplay() {
        const el = document.getElementById("scoreDisplay");
        if (el) el.innerHTML = `Pontos: <strong>${score}</strong> &nbsp;|&nbsp; Recorde: <span id="highScore">${highScore}</span>`;
    }

    // Controles de toque
    const touchLeft = document.getElementById("touchLeft");
    const touchRight = document.getElementById("touchRight");
    let touchLeftActive = false;
    let touchRightActive = false;

    touchLeft.addEventListener("touchstart", e => { e.preventDefault(); touchLeftActive = true; }, { passive: false });
    touchLeft.addEventListener("touchend", () => { touchLeftActive = false; });
    touchRight.addEventListener("touchstart", e => { e.preventDefault(); touchRightActive = true; }, { passive: false });
    touchRight.addEventListener("touchend", () => { touchRightActive = false; });
    // Suporte a mouse (desktop)
    touchLeft.addEventListener("mousedown", () => { touchLeftActive = true; });
    document.addEventListener("mouseup", () => { touchLeftActive = false; touchRightActive = false; });
    touchRight.addEventListener("mousedown", () => { touchRightActive = true; });

    // Teclas pressionadas rastreadas por estado (evita delay de repetição do SO)
    const keys = {};
    function onKeyDown(e) { keys[e.key] = true; }
    function onKeyUp(e) { keys[e.key] = false; }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    function cleanup() {
        clearInterval(spawnIntervalId);
        clearInterval(scoreIntervalId);
        clearInterval(difficultyIntervalId);
        cancelAnimationFrame(frameId);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        document.removeEventListener("mouseup", () => {});
    }

    function createObstacle() {
        const size = Math.random() * 50 + 20;
        const x = Math.random() * (canvas.width - size);
        obstacles.push({ x, y: 0, width: size, height: size, speed: obstacleSpeed });
    }

    function drawGameOver() {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText("Deu bão não! 😢", canvas.width / 2, canvas.height / 2 - 28);
        ctx.font = "18px sans-serif";
        ctx.fillText(`Pontos: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText(`Recorde: ${highScore}`, canvas.width / 2, canvas.height / 2 + 38);
        ctx.font = "13px sans-serif";
        ctx.fillStyle = "#ccc";
        ctx.fillText("Clique em 'pspsps' pra jogar de novo!", canvas.width / 2, canvas.height / 2 + 70);
    }

    function drawPlayer() {
        if (playerImg.complete && playerImg.naturalWidth > 0) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = "#4fc3f7";
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    }

    function drawObstacle(obs) {
        if (obstacleImg.complete && obstacleImg.naturalWidth > 0) {
            ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = "#ef5350";
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    }

    function update() {
        if (gameOver) return;

        // Movimento contínuo baseado em estado de tecla — sem delay de repetição
        if ((keys["ArrowLeft"] || touchLeftActive) && player.x > 0)
            player.x -= player.speed;
        if ((keys["ArrowRight"] || touchRightActive) && player.x < canvas.width - player.width)
            player.x += player.speed;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.y += obs.speed;
            drawObstacle(obs);

            if (
                obs.y + obs.height > player.y &&
                obs.x < player.x + player.width &&
                obs.x + obs.width > player.x
            ) {
                gameOver = true;
                cleanup();
                highScore = Math.max(score, storedHigh);
                localStorage.setItem("powderHighScore", String(highScore));
                updateScoreDisplay();
                drawGameOver();
                setTimeout(() => { startButton.style.display = "inline"; }, 1200);
                return;
            }

            if (obs.y > canvas.height) obstacles.splice(i, 1);
        }

        frameId = requestAnimationFrame(update);
    }

    // Inicia após ambas as imagens carregarem (ou falharem — usa fallback de cores)
    let loadedCount = 0;
    function onAssetReady() {
        loadedCount++;
        if (loadedCount < 2) return;
        updateScoreDisplay();
        spawnIntervalId = setInterval(createObstacle, 1000);
        scoreIntervalId = setInterval(() => {
            score++;
            if (score > highScore) highScore = score;
            updateScoreDisplay();
        }, 500);
        difficultyIntervalId = setInterval(() => {
            obstacleSpeed = Math.min(obstacleSpeed + 0.5, 12);
        }, 5000);
        frameId = requestAnimationFrame(update);
    }

    playerImg.onload = onAssetReady;
    playerImg.onerror = onAssetReady;
    obstacleImg.onload = onAssetReady;
    obstacleImg.onerror = onAssetReady;
}