document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("game-area");
    const logo = document.querySelector(".logo");
    const healthDisplay = document.getElementById("health");
    const ammoDisplay = document.getElementById("ammo");
    const bombDisplay = document.getElementById("bomb");
    const killDisplay = document.getElementById("kill");
    
    let enemyTypes = ["green"];
    let health = 100;
    let ammo = 6;
    let bomb = 3;
    let kills = 0;
    let isReloading = false;
    let reloadTime = 500;
    let waveNumber = 0;
    let gameStarted = false;

    const character = document.getElementById("character");

    gameArea.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (gameStarted && bomb > 0) {
            bomb--
            throwBomb(event);
            updateUI();
        }
    });

    function throwBomb(event) {
        const bomb = document.createElement("div");
        bomb.classList.add("bomb");
        bomb.style.position = "absolute";
        bomb.style.width = "20px";
        bomb.style.height = "20px";
        bomb.style.backgroundColor = "black";
        bomb.style.borderRadius = "50%";
        bomb.style.zIndex = "10";

        const bombX = event.clientX;
        const bombY = event.clientY;
        bomb.style.left = `${bombX - 10}px`;
        bomb.style.top = `${bombY - 10}px`;

        gameArea.appendChild(bomb);

        setTimeout(() => {
            const explosion = document.createElement("div");
            explosion.classList.add("explosion");
            explosion.style.position = "absolute";
            explosion.style.width = "100px";
            explosion.style.height = "100px";
            explosion.style.backgroundColor = "rgba(255, 69, 0, 0.8)";
            explosion.style.borderRadius = "50%";
            explosion.style.zIndex = "9";
            explosion.style.left = `${bombX - 60}px`;
            explosion.style.top = `${bombY - 60}px`;
            explosion.style.transition = "opacity 0.5s ease";

            gameArea.appendChild(explosion);

            const enemies = document.querySelectorAll(".enemy");
            enemies.forEach((enemy) => {
                const enemyRect = enemy.getBoundingClientRect();
                const distance = Math.sqrt(Math.pow(bombX - (enemyRect.left + enemyRect.width / 2), 2) + Math.pow(bombY - (enemyRect.top + enemyRect.height / 2), 2));

                if (distance <= 60) {
                    enemy.remove();
                    kills++;
                    updateUI();
                }
            });

            setTimeout(() => {
                explosion.style.opacity = "0";
                setTimeout(() => {
                    explosion.remove();
                }, 500);
            }, 500);

            bomb.remove();
        }, 1000);
    }

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

    gameArea.addEventListener("click", (event) => {
        event.preventDefault();
        if (gameStarted && ammo > 0 && !isReloading) {
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

    gameArea.addEventListener("mousemove", (event) => {
        const characterRect = character.getBoundingClientRect();
        const characterCenterX = characterRect.left + characterRect.width / 2;
        const characterCenterY = characterRect.top + characterRect.height / 2;

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const deltaX = mouseX - characterCenterX;
        const deltaY = mouseY - characterCenterY;

        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        character.style.transform = `translateX(-50%) rotate(${angle + 90}deg)`;
    });

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

            const enemies = document.querySelectorAll(".enemy");
            enemies.forEach((enemy) => {
                const enemyRect = enemy.getBoundingClientRect();
                const bulletRect = bullet.getBoundingClientRect();

                if (bulletRect.left < enemyRect.right && bulletRect.right > enemyRect.left && bulletRect.top < enemyRect.bottom && bulletRect.bottom > enemyRect.top) {
                    enemy.remove();
                    bullet.remove();
                    clearInterval(bulletInterval);
                    kills++;
                    updateUI();
                }
            });

            if (currentLeft < 0 || currentLeft > window.innerWidth || currentTop < 0 || currentTop > window.innerHeight) {
                bullet.remove();
                clearInterval(bulletInterval);
            }
        }, 30);
    }

    function reload() {
        if (!isReloading) {
            isReloading = true;
            reload();
        } else {
            if (ammo < 6) {
                setTimeout(() => {
                    ammo++;
                    updateUI();
                    if (ammo == 6) {
                        isReloading = false;
                    } else {
                        reload();
                    }
                }, reloadTime);
            } else {
                return;
            }
        }
    }

    function createEnemy() {
        const enemy = document.createElement("div");
        enemy.style.position = "absolute";
        enemy.style.top = "0px";
        enemy.style.left = `${Math.random() * 80 + 10}%`;
        enemy.style.width = "40px";
        enemy.style.height = "40px";
        enemy.style.borderRadius = "50%";

        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        enemy.classList.add("enemy", enemyType);

        let enemySpeed;
        let enemyHealth;
        let attackDistance;
        switch (enemyType) {
            case "green":
                enemySpeed = 1;
                enemyHealth = 10;
                enemy.style.backgroundColor = "#4bf275";
                break;
            case "cyan":
                enemySpeed = 1.5;
                enemyHealth = 10;
                enemy.style.backgroundColor = "#a0e8ff";
                break;
            case "blue":
                enemySpeed = 1;
                enemyHealth = 8;
                enemy.style.backgroundColor = "#7bafff";
                break;
            case "purple":
                enemySpeed = 1.5;
                enemyHealth = 12;
                enemy.style.backgroundColor = "#b39ddb";
                break;
            case "pink":
                enemySpeed = 0.8;
                enemyHealth = 20;
                enemy.style.backgroundColor = "#f9a1bc";
                break;
            case "red":
                enemySpeed = 2;
                enemyHealth = 5;
                enemy.style.backgroundColor = "#ff8a80";
                break;
        }    

        gameArea.appendChild(enemy);

        function shootBullet(enemy, characterRect) {
            const bullet = document.createElement("div");
            bullet.classList.add("enemy-bullet");
            bullet.style.position = "absolute";
            bullet.style.width = "8px";
            bullet.style.height = "8px";
            bullet.style.backgroundColor = "red";
            bullet.style.borderRadius = "50%";
            bullet.style.zIndex = "5";

            const enemyRect = enemy.getBoundingClientRect();
            const bulletX = enemyRect.left + enemyRect.width / 2;
            const bulletY = enemyRect.top + enemyRect.height / 2;

            bullet.style.left = `${bulletX}px`;
            bullet.style.top = `${bulletY}px`;

            gameArea.appendChild(bullet);

            const dx = characterRect.left + characterRect.width / 2 - bulletX;
            const dy = characterRect.top + characterRect.height / 2 - bulletY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const velocityX = (dx / distance) * 5;
            const velocityY = (dy / distance) * 5;

            const bulletInterval = setInterval(() => {
                const currentLeft = parseFloat(bullet.style.left);
                const currentTop = parseFloat(bullet.style.top);

                bullet.style.left = `${currentLeft + velocityX}px`;
                bullet.style.top = `${currentTop + velocityY}px`;

                const bulletRect = bullet.getBoundingClientRect();
                const characterCenterX = characterRect.left + characterRect.width / 2;
                const characterCenterY = characterRect.top + characterRect.height / 2;

                const distanceToCharacter = Math.sqrt(
                    Math.pow(bulletRect.left - characterCenterX, 2) +
                    Math.pow(bulletRect.top - characterCenterY, 2)
                );

                if (distanceToCharacter <= 15) {
                    health -= 5;
                    updateUI();
                    bullet.remove();
                    clearInterval(bulletInterval);
                    if (health <= 0) {
                        endGame();
                    }
                }

                if (
                    currentLeft < 0 ||
                    currentLeft > window.innerWidth ||
                    currentTop < 0 ||
                    currentTop > window.innerHeight
                ) {
                    bullet.remove();
                    clearInterval(bulletInterval);
                }
            }, 30);

            setTimeout(() => {
                enemy.shooting = false;
            }, 2000);
        }

        const enemyInterval = setInterval(() => {
            const enemyRect = enemy.getBoundingClientRect();
            const characterRect = character.getBoundingClientRect();

            const dx = characterRect.left + characterRect.width / 2 - (enemyRect.left + enemyRect.width / 2);
            const dy = characterRect.top + characterRect.height / 2 - (enemyRect.top + enemyRect.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const adjustedSpeed = enemySpeed + waveNumber * 0.1;

            if ((enemyType === "blue" || enemyType === "purple") && distance <= 200) {
                if (!enemy.shooting) {
                    enemy.shooting = true;
                    shootBullet(enemy, characterRect);
                }
            }

            if (enemyType !== "blue" && enemyType !== "purple" || distance > 200) {
                const velocityX = (dx / distance) * adjustedSpeed;
                const velocityY = (dy / distance) * adjustedSpeed;
                enemy.style.left = `${enemyRect.left + velocityX}px`;
                enemy.style.top = `${enemyRect.top + velocityY}px`;
            }

            if (distance <= 10) {
                if (enemyType === "red") {
                    health -= 20;
                    enemy.remove();
                } else {
                    health -= 10;
                    enemy.remove();
                }
                updateUI();
                clearInterval(enemyInterval);
                if (health <= 0) {
                    endGame();
                }
            }
        }, 30);
    }

    function startEnemySpawner() {
        setInterval(() => {
            if (gameStarted) {
                createEnemy();
            }
        }, 2000 - waveNumber * 200);
    }

    function showUpgradeMenu() {
        const options = ["Increase Health (+20)", "Decrease Reload Time (by 1/4)", "Add Bomb (1 bomb)"];
        const choice = prompt(`Choose an upgrade for your character: \n1: ${options[0]}\n2: ${options[1]}\n3: ${options[2]}`);
        
        switch (choice) {
            case "1":
                health += 20;
                updateUI();
                break;
            case "2":
                if (reloadTime /4 != 0) {
                    reloadTime /4
                } else {
                    alert("You can't shorten the time any further.");
                    showUpgradeMenu();
                }
                updateUI();
                break;
            case "3":
                bomb += 1;
                updateUI();
                break;
            default:
                alert("Invalid choice. No upgrade selected.");
                showUpgradeMenu();
        }
    }

    setInterval(() => {
        if (gameStarted) {
            waveNumber = waveNumber + 5;
            if (waveNumber % 10 === 0) {
                showUpgradeMenu();
            }
            if (waveNumber > 50) {
                enemyTypes = ["green", "cyan", "blue", "purple", "pink", "red"];
            } else if (waveNumber > 45) {
                enemyTypes = ["green", "cyan", "blue", "purple", "pink"];
            } else if (waveNumber > 40) {
                enemyTypes = ["green", "cyan", "blue", "purple"];
            } else if (waveNumber > 35) {
                enemyTypes = ["green", "cyan", "blue"];
            } else if (waveNumber > 30) {
                enemyTypes = ["green", "cyan"];
            } else if (waveNumber > 25) {
                enemyTypes = ["green"];
            }
        }
    }, 10000);

    function updateUI() {
        healthDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=19411&format=png"> ${health}`;
        ammoDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=17892&format=png"> ${ammo}/6`;
        bombDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=17906&format=png"> ${bomb}`;
        killDisplay.innerHTML = `<img src="https://img.icons8.com/?size=48&id=14870&format=png"> ${kills}`;
    }

    function endGame() {
        gameStarted = false;
        alert("Game Over! Your Score: " + kills);
        location.reload();
    }
});