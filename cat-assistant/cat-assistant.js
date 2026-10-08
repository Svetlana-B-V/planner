// ... existing code ...
document.addEventListener('DOMContentLoaded', () => {
    createCatAssistantDOM();
    initCatBehavior();
});

function createCatAssistantDOM() {
    if (document.getElementById('catAssistantContainer')) return;

    const container = document.createElement('div');
    container.id = 'catAssistantContainer';
    container.innerHTML = `
        <div id="catThoughtBubble">
            <span id="catMessageText">Мур! Я проверяю задачи, дедлайн которых наступит через 2 дня...</span>
        </div>
        <div id="catSpriteWrapper" title="Кот Ниндзя - Ваш помощник по дедлайнам">
            <img id="catSpriteImg" src="cat-assistant/img/Gemini_Generated_Image_lcth9glcth9glcth (4)-no-bg-preview (carve.photos).png" alt="Кот ассистент" style="width: 120px; height: auto;" />
        </div>
    `;
    document.body.appendChild(container);
}

function initCatBehavior() {
    const container = document.getElementById('catAssistantContainer');
    const msgEl = document.getElementById('catMessageText');
    const spriteImg = document.getElementById('catSpriteImg');

    if (!container || !msgEl || !spriteImg) return;

    let positionPercent = 15;
    let direction = 1;
    let isSitting = false;

    const walkFrames = [
        "Gemini_Generated_Image_lcth9glcth9glcth (4)-no-bg-preview (carve.photos).png",
        "Gemini_Generated_Image_lcth9glcth9glcth (3)-no-bg-preview (carve.photos).png",
        "Gemini_Generated_Image_lcth9glcth9glcth (2)-edited-free (carve.photos).jpg",
        "Gemini_Generated_Image_lcth9glcth9glcth (1)-no-bg-preview (carve.photos).png",
        "Gemini_Generated_Image_lcth9glcth9glcth-edited-free (carve.photos).png"
    ];
    let currentWalkFrameIndex = 0;
    const sitPoseImg = "7.png";

    setInterval(() => {
        if (!isSitting) {
            positionPercent += direction * 2;
            if (positionPercent > 80) {
                direction = -1;
                spriteImg.style.transform = 'scaleX(-1)';
            } else if (positionPercent < 10) {
                direction = 1;
                spriteImg.style.transform = 'scaleX(1)';
            }
            container.style.left = positionPercent + '%';

            currentWalkFrameIndex = (currentWalkFrameIndex + 1) % walkFrames.length;
            spriteImg.src = `cat-assistant/img/${walkFrames[currentWalkFrameIndex]}`;
        }
    }, 400);

    setInterval(() => {
        if (Math.random() > 0.7 && !isSitting) {
            isSitting = true;
            spriteImg.src = `cat-assistant/img/${sitPoseImg}`;
            setTimeout(() => {
                isSitting = false;
            }, 3000 + Math.random() * 4000);
        }
    }, 15000);

    function checkUrgentTasks() {
        try {
            const projects = JSON.parse(localStorage.getItem('auratask_projects'));
            if (!projects) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let urgentTasks = [];

            for (const key in projects) {
                const proj = projects[key];
                if (proj && proj.tasks) {
                    collectUrgent(proj.tasks, today, urgentTasks);
                }
            }

            if (urgentTasks.length > 0) {
                const randomTask = urgentTasks[Math.floor(Math.random() * urgentTasks.length)];
                msgEl.innerHTML = `<b>Мур!</b> Срок задачи <i>"${randomTask.text}"</i> истекает (${randomTask.endDate || randomTask.date})! Пора за работу! 🐾`;
                
                isSitting = true;
                spriteImg.src = `cat-assistant/img/${sitPoseImg}`;
                setTimeout(() => { isSitting = false; }, 6000);

            } else {
                const chillPhrases = [
                    "Мур-мяу! Все дедлайны под контролем, лапки чисты!",
                    "Шуршу хвостиком... Ближайшие 2 дня горящих задач нет.",
                    "Мур! Не забудьте проверить таймлайн и отдохнуть.",
                    "Мяу! Отличная работа, все задачи вовремя!"
                ];
                msgEl.textContent = chillPhrases[Math.floor(Math.random() * chillPhrases.length)];
            }
        } catch (e) {
            console.error(e);
        }
    }

    function collectUrgent(tasks, today, resultList) {
        tasks.forEach(t => {
            if (!t.completed && !t.hidden && t.endDate) {
                const endDate = new Date(t.endDate);
                endDate.setHours(0, 0, 0, 0);

                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 2) {
                    resultList.push(t);
                }
            }
            if (t.subtasks && t.subtasks.length > 0) {
                collectUrgent(t.subtasks, today, resultList);
            }
        });
    }

    setTimeout(checkUrgentTasks, 2000);
    setInterval(checkUrgentTasks, 15000);

    spriteImg.onclick = () => {
        checkUrgentTasks();
        isSitting = true;
        spriteImg.src = `cat-assistant/img/${sitPoseImg}`;
        spriteImg.style.transform = spriteImg.style.transform.includes('scaleX(-1)') 
            ? 'scaleX(-1) scale(1.1)' 
            : 'scaleX(1) scale(1.1)';
            
        setTimeout(() => { 
            spriteImg.style.transform = spriteImg.style.transform.includes('scaleX(-1)') 
                ? 'scaleX(-1)' 
                : 'scaleX(1)';
            isSitting = false; 
        }, 3000);
    };
}
// ... existing code ...