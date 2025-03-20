const startButton = document.getElementById("startButton");
const gameContainer = document.getElementById("gameContainer");

startButton.addEventListener("click", () => {
    startButton.style.display = "none"; // Esconde o botão
    gameContainer.style.display = "block"; // Mostra o jogo

    // Reseta o jogo criando um novo canvas
    document.getElementById("gameCanvas")?.remove(); // Remove o canvas antigo se existir
    const canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";
    gameContainer.appendChild(canvas);

    startGame(); // Inicia o jogo do zero
});

function startGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 350;

    // Carregar imagens
    const playerImg = new Image();
    playerImg.src = "./img/player.png"; // Ajuste o caminho conforme necessário

    const obstacleImg = new Image();
    obstacleImg.src = "./img/obstacle.png"; // Ajuste o caminho conforme necessário

    let player = { x: 175, y: 300, width: 50, height: 50, speed: 5 };
    let obstacles = [];
    let gameOver = false;

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
        if (event.key === "ArrowRight" && player.x < canvas.width - player.width) player.x += player.speed;
    });

    function createObstacle() {
        let size = Math.random() * 50 + 20;
        let x = Math.random() * (canvas.width - size);
        obstacles.push({ x, y: 0, width: size, height: size, speed: 3 });
    }

    function update() {
        if (gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha jogador com imagem
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

        // Move e desenha obstáculos com imagem
        obstacles.forEach((obs, i) => {
            obs.y += obs.speed;
            ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);

            // Verifica colisão
            if (
                obs.y + obs.height > player.y &&
                obs.x < player.x + player.width &&
                obs.x + obs.width > player.x
            ) {
                gameOver = true;

                setTimeout(() => {
                    alert("Deu bão não! Clique em 'pspsps' pra jogar novamente. Vai meu amô eu acredito!");
                    startButton.style.display = "inline"; // Mostra o botão novamente
                }, 100);
            }

            // Remove obstáculos fora da tela
            if (obs.y > canvas.height) obstacles.splice(i, 1);
        });

        requestAnimationFrame(update);
    }

    // Inicia o jogo após carregar as imagens
    playerImg.onload = () => {
        obstacleImg.onload = () => {
            setInterval(createObstacle, 1000);
            update();
        };
    };
}