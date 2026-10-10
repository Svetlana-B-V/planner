document.addEventListener('DOMContentLoaded', () => {
    createCatAssistantDOM();
    initCatBehavior();
});

// Создаем HTML структуру для кота-ассистента
function createCatAssistantDOM() {
    if (document.getElementById('catAssistantContainer')) return;
    
    const container = document.createElement('div');
    container.id = 'catAssistantContainer';
    // Используем готовые предоставленные картинки
    container.innerHTML = `
        <div id="catThoughtBubble">
            <span id="catMessageText">Мур! Ищу задачи...</span>
        </div>
        <div id="catSpriteWrapper" title="Кот Ниндзя - Ваш помощник">
            <img id="catSpriteImg" src="cat-assistant/img/Gemini_Generated_Image_lcth9glcth9glcth (4)-no-bg-preview (carve.photos).png" alt="Кот" style="width: 120px; height: auto;" />
        </div>
    `;
    document.body.appendChild(container);
}

// Инициализируем логику движения и напоминаний
function initCatBehavior() {
    const container = document.getElementById('catAssistantContainer');
    const msgEl = document.getElementById('catMessageText');
    const spriteImg = document.getElementById('catSpriteImg');
    
    if (!container || !msgEl || !spriteImg) return;

    // Переменные для расчета плавного движения
    let xPos = 0;
    let direction = 1; // 1 = вправо, -1 = влево
    let isSitting = false;
    let speed = 90; // Скорость в пикселях в секунду
    
    let lastTime = performance.now();
    let lastFrameTime = lastTime;

    // Массив кадров анимации ходьбы
    const walkFrames = [
        "Gemini_Generated_Image_lcth9glcth9glcth (4)-no-bg-preview (carve.photos).png",
        "Gemini_Generated_Image_lcth9glcth9glcth (3)-no-bg-preview (carve.photos).png",
        "Gemini_Generated_Image_lcth9glcth9glcth (1)-no-bg-preview (carve.photos).png",
        "Gemini_Generated_Image_lcth9glcth9glcth-edited-free (carve.photos).png"
    ];
    let currentWalkFrameIndex = 0;
    const sitPoseImg = "7.png";

    // Главный цикл анимации (60fps)
    function animateCat(time) {
        // Вычисляем разницу во времени для независимой от частоты кадров скорости
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        if (!isSitting) {
            // Передвигаем контейнер
            xPos += speed * direction * dt;
            const maxW = window.innerWidth - (spriteImg.offsetWidth || 120);

            // Обработка столкновения с краями экрана
            if (xPos >= maxW) {
                xPos = maxW; 
                direction = -1; 
                spriteImg.style.transform = 'scaleX(-1)';
            } else if (xPos <= 0) {
                xPos = 0; 
                direction = 1; 
                spriteImg.style.transform = 'scaleX(1)';
            }
            // Используем translate3d для аппаратного ускорения видеокартой
            container.style.transform = `translate3d(${xPos}px, 0, 0)`;

            // Смена спрайта для имитации ходьбы (каждые 120мс)
            if (time - lastFrameTime > 120) {
                lastFrameTime = time;
                currentWalkFrameIndex = (currentWalkFrameIndex + 1) % walkFrames.length;
                spriteImg.src = `cat-assistant/img/${walkFrames[currentWalkFrameIndex]}`;
            }
        }
        
        requestAnimationFrame(animateCat);
    }
    
    // Запускаем плавную анимацию
    requestAnimationFrame(animateCat);

    // Случайная остановка (кот садится отдохнуть)
    setInterval(() => {
        if (Math.random() > 0.6 && !isSitting) {
            isSitting = true;
            spriteImg.src = `cat-assistant/img/${sitPoseImg}`;
            // Сидит случайное время от 3 до 8 секунд
            setTimeout(() => { isSitting = false; }, 3000 + Math.random() * 5000);
        }
    }, 12000);

    // Функция проверки горящих задач
    function checkUrgentTasks() {
        try {
            const projects = JSON.parse(localStorage.getItem('auratask_projects'));
            if (!projects) return;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            let urgentTasks = [];

            // Рекурсивный поиск горящих задач
            const collect = (tasks) => tasks.forEach(t => {
                if (!t.completed && !t.hidden && t.endDate) {
                    const diffDays = Math.ceil((new Date(t.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 2) urgentTasks.push(t);
                }
                if (t.subtasks) collect(t.subtasks);
            });
            Object.values(projects).forEach(p => collect(p.tasks || []));

            if (urgentTasks.length > 0) {
                const randomTask = urgentTasks[Math.floor(Math.random() * urgentTasks.length)];
                msgEl.innerHTML = `<b>Мур!</b> Срок задачи <i>"${randomTask.text}"</i> истекает! Пора за работу! 🐾`;
                
                // Обязательно садится при уведомлении
                isSitting = true; 
                spriteImg.src = `cat-assistant/img/${sitPoseImg}`;
                setTimeout(() => { isSitting = false; }, 7000);
            } else {
                const phrases = [
                    "Мур-мяу! Все дедлайны под контролем!", 
                    "Шуршу лапками... Горящих задач нет.", 
                    "Мяу! Отличная работа!"
                ];
                msgEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
            }
        } catch (e) { console.error(e); }
    }

    // Первичная и периодическая проверка
    setTimeout(checkUrgentTasks, 2000);
    setInterval(checkUrgentTasks, 15000);

    // Взаимодействие по клику
    spriteImg.onclick = () => {
        checkUrgentTasks();
        isSitting = true;
        spriteImg.src = `cat-assistant/img/${sitPoseImg}`;
        // Легкое увеличение при клике
        spriteImg.style.transform = `scaleX(${direction}) scale(1.1)`;
        setTimeout(() => { 
            spriteImg.style.transform = `scaleX(${direction})`; 
            isSitting = false; 
        }, 3000);
    };
}