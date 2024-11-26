document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("game-area");
    const logo = document.querySelector(".logo");
    const healthDisplay = document.getElementById("health");
    const ammoDisplay = document.getElementById("ammo");
    const killDisplay = document.getElementById("kill");

    let health = 100;
    let ammo = 6;
    let kills = 0;
    let isReloading = false;
    let reloadTime = 500;

    let gameStarted = false;

    // Karakterin eli (merminin çıkış noktası)
    const character = document.getElementById("character");
    const characterRect = character.getBoundingClientRect();

    // Oyun başlangıç mantığı
    gameArea.addEventListener("click", () => {
        if (!gameStarted) {
            logo.style.transition = "opacity 1s, transform 1s";
            logo.style.opacity = "0";
            setTimeout(() => {
                logo.style.display = "none";
                gameStarted = true;
                startEnemySpawner();
            }, 1000);
        }
    });

    // Sol tıkla mermi ateşleme
    gameArea.addEventListener("click", (event) => {
        event.preventDefault();
        if (gameStarted && ammo > 0) {
            ammo--;
            fireBullet(event);
            updateUI();
        } else {
            if (ammo <= 0 && !isReloading) {
                reload();
                return;
            }
        }
    });

    // Mermi oluştur ve hareket ettir
    function fireBullet(event) {
        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.style.position = "absolute";
        bullet.style.width = "10px";
        bullet.style.height = "10px";
        bullet.style.backgroundColor = "yellow";
        bullet.style.borderRadius = "50%";
        bullet.style.zIndex = "5";

        const characterRect = character.getBoundingClientRect();
        const bulletX = characterRect.left + characterRect.width / 2;
        const bulletY = characterRect.top + characterRect.height / 2;

        bullet.style.left = `${bulletX}px`;
        bullet.style.top = `${bulletY}px`;

        gameArea.appendChild(bullet);

        const targetX = event.clientX;
        const targetY = event.clientY;

        const dx = targetX - bulletX;
        const dy = targetY - bulletY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const velocityX = (dx / distance) * 10;
        const velocityY = (dy / distance) * 10;

        const bulletInterval = setInterval(() => {
            const currentLeft = parseFloat(bullet.style.left);
            const currentTop = parseFloat(bullet.style.top);

            bullet.style.left = `${currentLeft + velocityX}px`;
            bullet.style.top = `${currentTop + velocityY}px`;

            // Çarpışma kontrolü
            const enemies = document.querySelectorAll(".enemy");
            enemies.forEach((enemy) => {
                const enemyRect = enemy.getBoundingClientRect();
                const bulletRect = bullet.getBoundingClientRect();

                if (bulletRect.left < enemyRect.right && bulletRect.right > enemyRect.left && bulletRect.top < enemyRect.bottom && bulletRect.bottom > enemyRect.top) {
                    // Düşmanı kaldır
                    enemy.remove();

                    // Mermiyi kaldır
                    bullet.remove();
                    clearInterval(bulletInterval);

                    // Kill puanını artır ve UI'yi güncelle
                    kills++;
                    updateUI();
                }
            });

            // Mermi ekranın dışına çıkarsa kaldır
            if (currentLeft < 0 || currentLeft > window.innerWidth || currentTop < 0 || currentTop > window.innerHeight) {
                bullet.remove();
                clearInterval(bulletInterval);
            }
        }, 30);
    }

    // Reload işlemi
    function reload() {
        if (!isReloading) {
            isReloading = true;

            console.log("Reloading...");

            setTimeout(() => {
                ammo++;
                updateUI();
                if (ammo == 6) {
                    isReloading = false;
                } else {
                    isReloading = false;
                    reload()
                }
            }, reloadTime);
        } else {
            return;
        }
    }

    // Rastgele düşman oluşturucu
    function createEnemy() {
        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.position = "absolute";
        enemy.style.top = "0px";
        enemy.style.left = `${Math.random() * 80 + 10}%`; // Yatay konum rastgele
        enemy.style.width = "40px";
        enemy.style.height = "40px";
        enemy.style.backgroundColor = "red";
        enemy.style.borderRadius = "50%";

        gameArea.appendChild(enemy);

        // Düşman hareketi (yavaşça aşağı inme)
        const enemyInterval = setInterval(() => {
            const currentTop = parseFloat(enemy.style.top);
            enemy.style.top = currentTop + 3 + "px";

            // Düşman oyuncuya ulaştığında
            if (currentTop >= window.innerHeight - 100) {
                health -= 10;
                updateUI();
                enemy.remove();
                clearInterval(enemyInterval);

                if (health <= 0) {
                    endGame();
                }
            }
        }, 100);
    }

    // Düşmanları sürekli oluştur
    function startEnemySpawner() {
        setInterval(() => {
            if (gameStarted) {
                createEnemy();
            }
        }, 2000); // Her 2 saniyede bir düşman yarat
    }

    // UI güncelleme
    function updateUI() {
        healthDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=19411&format=png"> ${health}`;
        ammoDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=17892&format=png"> ${ammo}/6`;
        killDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=14870&format=png"> ${kills}`;
    }

    // Oyunu bitir
    function endGame() {
        gameStarted = false;
        alert("Oyun Bitti! Skorunuz: " + kills);
        location.reload();
    }
});
