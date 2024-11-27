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
    let waveNumber = 1;
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

    // Sağ tıkla mermi ateşleme
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
    
        // Karakter ile mouse arasındaki yatay ve dikey farkı hesapla
        const deltaX = mouseX - characterCenterX;
        const deltaY = mouseY - characterCenterY;
    
        // Aradaki açıyı hesapla (radyan cinsinden)
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // Radyanı dereceye çevir
    
        // Karakteri bu açıya göre döndür (transform-origin: center ile merkezden döner)
        character.style.transform = `translateX(-50%) rotate(${angle+90}deg)`;
        console.log(angle)
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
            reload()
        } else {
            if (ammo < 6) {
                setTimeout(() => {
                    ammo++;
                    updateUI();
                    if (ammo == 6) {
                        isReloading = false;
                    } else {
                        reload()
                    }
                }, reloadTime);
            } else {
                return;
            }
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
    
        // Dalga sayısına göre zorluk arttırma
        const enemySpeed = 1 + waveNumber * 0.1; // Hız artışı
        const enemyHealth = 10 + waveNumber * 5; // Can artışı
        const attackDistance = 10 + waveNumber * 5; // Vurma mesafesi artışı
    
        // Düşman hareketi (karaktere doğru yaklaşacak şekilde hareket)
        const enemyInterval = setInterval(() => {
            const enemyRect = enemy.getBoundingClientRect();
            const characterRect = character.getBoundingClientRect();
    
            // Düşman ile karakter arasındaki mesafeyi hesapla
            const dx = characterRect.left + characterRect.width / 2 - (enemyRect.left + enemyRect.width / 2);
            const dy = characterRect.top + characterRect.height / 2 - (enemyRect.top + enemyRect.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            // Yavaşça hareket et (hız)
            const velocityX = (dx / distance) * enemySpeed;
            const velocityY = (dy / distance) * enemySpeed;
    
            // Düşmanı hareket ettir
            enemy.style.left = `${enemyRect.left + velocityX}px`;
            enemy.style.top = `${enemyRect.top + velocityY}px`;
    
            // Düşman 10px'e yaklaşırsa oyuncunun canını azalt
            if (distance <= attackDistance) {
                health -= 10; // Canı azalt
                updateUI(); // UI'yi güncelle
                enemy.remove(); // Düşmanı kaldır
                clearInterval(enemyInterval); // Düşmanın hareketini durdur
    
                if (health <= 0) {
                    endGame(); // Oyunu bitir
                }
            }
        }, 30); // Düşman hareketi 30ms'de bir güncellenir
    }    


    // Düşmanları sürekli oluştur
    function startEnemySpawner() {
        setInterval(() => {
            if (gameStarted) {
                createEnemy();
            }
        }, 2000 - waveNumber * 200); // Dalga sayısına göre hızlanma
    }    

    setInterval(() => {
        if (gameStarted) {
            waveNumber++; // Dalga numarasını artır
        }
    }, 10000); // 10 saniyede bir dalga artışı
    

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
