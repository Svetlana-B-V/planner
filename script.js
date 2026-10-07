let projectsData = JSON.parse(localStorage.getItem('auratask_projects')) || {
    work: {
        name: '💼 Работа',
        tasks: [
            {
                id: 'w_1',
                text: 'Рефакторинг архитектуры микросервисов',
                completed: false,
                priority: 'high',
                date: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                hidden: false,
                subtasks: [
                    { id: 'w_1_1', text: 'Провести аудит текущих API эндпоинтов', completed: true, priority: 'high', date: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], hidden: false, subtasks: [] },
                    { id: 'w_1_2', text: 'Написать модульные тесты', completed: false, priority: 'medium', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], hidden: false, subtasks: [] }
                ]
            }
        ]
    },
    hackathon: {
        name: '🚀 Хакатоны',
        tasks: [
            {
                id: 'h_1',
                text: 'AI Hackathon 2026: Разработка прототипа',
                completed: false,
                priority: 'high',
                date: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
                hidden: false,
                subtasks: [
                    { id: 'h_1_1', text: 'Собрать команду и распределить роли', completed: true, priority: 'high', date: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], hidden: false, subtasks: [] },
                    { id: 'h_1_2', text: 'Интегрировать LLM API для генерации отчетов', completed: false, priority: 'high', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], hidden: false, subtasks: [] }
                ]
            }
        ]
    },
    utilities: {
        name: '💡 Коммунальные услуги',
        tasks: [
            {
                id: 'u_1',
                text: 'Оплата коммунальных услуг за текущий месяц',
                completed: false,
                priority: 'high',
                date: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                hidden: false,
                subtasks: []
            }
        ]
    }
};

let currentCategory = 'work';
let currentFilter = 'all';
let searchQuery = '';
let currentSeasonSetting = localStorage.getItem('auratask_season') || 'auto';
let currentTab = 'tasks';
let showHiddenPanelState = false;

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedDateStr = new Date().toISOString().split('T')[0];

function getAutoSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

function getActiveSeason() {
    if (currentSeasonSetting === 'auto') return getAutoSeason();
    return currentSeasonSetting;
}

function updateSeasonTheme() {
    const season = getActiveSeason();
    const bgEl = document.getElementById('seasonBg');
    if (bgEl) {
        bgEl.className = 'season-bg season-' + season;
    }
}

const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let streamWave = 0;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        const season = getActiveSeason();
        this.x = canvas ? Math.random() * canvas.width : 0;
        if (season === 'spring') {
            this.y = canvas ? Math.random() * canvas.height : 0;
        } else {
            this.y = canvas ? Math.random() * -canvas.height : 0;
        }
        this.size = Math.random() * 6 + 3;
        this.speedY = season === 'spring' ? (Math.random() * 2 + 1) : (Math.random() * 1.5 + 0.5);
        this.speedX = (Math.random() - 0.5) * (season === 'spring' ? 3 : 1.2);
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.6 + 0.3;
    }
    update() {
        if (!canvas) return;
        const season = getActiveSeason();
        if (season === 'spring') {
            streamWave += 0.03;
            this.x += this.speedX + Math.sin(streamWave) * 1.2;
            this.y += this.speedY;
            if (this.y > canvas.height + 10 || this.x > canvas.width + 10 || this.x < -10) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
            }
        } else {
            this.y += this.speedY;
            this.x += this.speedX + (season === 'autumn' ? 0.6 : 0);
            this.rotation += this.rotSpeed;

            if (this.y > canvas.height + 10 || this.x > canvas.width + 10 || this.x < -10) {
                this.reset();
                this.y = -10;
            }
        }
    }
    draw() {
        if (!ctx) return;
        const season = getActiveSeason();
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (season === 'winter') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (season === 'autumn') {
            ctx.fillStyle = Math.random() > 0.5 ? '#d97706' : '#ea580c';
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 0.7);
        } else if (season === 'summer') {
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function initParticles() {
    if (!canvas) return;
    particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }
}

function animateParticles() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

function saveProjects() {
    localStorage.setItem('auratask_projects', JSON.stringify(projectsData));
    renderAll();
}

function getActiveTasks() {
    return projectsData[currentCategory].tasks;
}

function promptAddCategory() {
    const name = prompt('Введите название нового проекта / категории:');
    if (name && name.trim() !== '') {
        const key = 'proj_' + Math.random().toString(36).substr(2, 6);
        projectsData[key] = {
            name: name.trim(),
            tasks: []
        };
        currentCategory = key;
        saveProjects();
    }
}

function findTaskAndMutate(taskList, id, callback) {
    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].id === id) {
            return callback(taskList, i);
        }
        if (taskList[i].subtasks && taskList[i].subtasks.length > 0) {
            const found = findTaskAndMutate(taskList[i].subtasks, id, callback);
            if (found) return true;
        }
    }
}

function addTask(parentId, text, priority, dateStr, endDateStr) {
    if (!text || text.trim() === '') return;
    const start = dateStr || new Date().toISOString().split('T')[0];
    const end = endDateStr || start;
    const newTask = {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        completed: false,
        priority: priority || 'medium',
        date: start,
        endDate: end < start ? start : end,
        hidden: false,
        subtasks: []
    };

    const taskList = getActiveTasks();
    if (parentId === null || parentId === undefined) {
        taskList.push(newTask);
    } else {
        findTaskAndMutate(taskList, parentId, (list, index) => {
            if (!list[index].subtasks) list[index].subtasks = [];
            list[index].subtasks.push(newTask);
            return true;
        });
    }
    saveProjects();
}

function toggleTask(id) {
    findTaskAndMutate(getActiveTasks(), id, (list, index) => {
        list[index].completed = !list[index].completed;
        return true;
    });
    saveProjects();
}

function toggleHideTask(id) {
    findTaskAndMutate(getActiveTasks(), id, (list, index) => {
        list[index].hidden = !list[index].hidden;
        return true;
    });
    saveProjects();
}

function deleteTask(id) {
    findTaskAndMutate(getActiveTasks(), id, (list, index) => {
        list.splice(index, 1);
        return true;
    });
    saveProjects();
}

function editTaskText(id, newText) {
    if (!newText || newText.trim() === '') return;
    findTaskAndMutate(getActiveTasks(), id, (list, index) => {
        list[index].text = newText.trim();
        return true;
    });
    saveProjects();
}

function switchCategory(catKey) {
    currentCategory = catKey;
    renderAll();
}

function calculateStats(taskList) {
    let total = 0;
    let completed = 0;
    let hiddenCount = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    function recurse(items) {
        items.forEach(item => {
            total++;
            if (item.completed) completed++;
            if (item.hidden) hiddenCount++;
            if (item.priority === 'high') high++;
            else if (item.priority === 'medium') medium++;
            else low++;

            if (item.subtasks && item.subtasks.length > 0) {
                recurse(item.subtasks);
            }
        });
    }

    recurse(taskList);
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, completed, progress, hiddenCount, high, medium, low };
}

function filterByStat(type) {
    switchTab('tasks');
    currentFilter = type;
    if (type === 'all') {
        document.getElementById('activeFilterLabel').innerText = 'Все';
    } else if (type === 'active' || type === 'pending') {
        currentFilter = 'active';
        document.getElementById('activeFilterLabel').innerText = 'Активные';
    } else if (type === 'completed') {
        currentFilter = 'completed';
        document.getElementById('activeFilterLabel').innerText = 'Готовые';
    }
    renderAll();
}

function openProgressModal() {
    const stats = calculateStats(getActiveTasks());
    document.getElementById('modalProgressPercent').innerText = stats.progress + '%';
    document.getElementById('modalCircleProgress').setAttribute('stroke-dasharray', `${stats.progress}, 100`);
    document.getElementById('modalDoneCount').innerText = stats.completed;
    document.getElementById('modalPendingCount').innerText = stats.pending;

    document.getElementById('statHighCount').innerText = stats.high;
    document.getElementById('statMedCount').innerText = stats.medium;
    document.getElementById('statLowCount').innerText = stats.low;

    const totalP = stats.total > 0 ? stats.total : 1;
    document.getElementById('barHigh').style.width = Math.round((stats.high / totalP) * 100) + '%';
    document.getElementById('barMed').style.width = Math.round((stats.medium / totalP) * 100) + '%';
    document.getElementById('barLow').style.width = Math.round((stats.low / totalP) * 100) + '%';

    document.getElementById('progressModal').classList.remove('hidden-el');
}

function closeProgressModal() {
    document.getElementById('progressModal').classList.add('hidden-el');
}

function renderTaskNode(task, depth) {
    if (task.hidden) return '';

    let priorityBadge = '';
    if (task.priority === 'high') {
        priorityBadge = '<span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-rose-50 text-rose-600 border border-rose-100">Высокий</span>';
    } else if (task.priority === 'medium') {
        priorityBadge = '<span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-amber-50 text-amber-600 border border-amber-100">Средний</span>';
    } else {
        priorityBadge = '<span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-50 text-blue-600 border border-blue-100">Низкий</span>';
    }

    const dateBadge = task.date ? `<span class="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-regular fa-calendar text-[9px]"></i>${task.date}</span>` : '';

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const indentClass = depth > 0 ? 'ml-4 sm:ml-6 mt-2 border-l-2 border-indigo-100 pl-3 sm:pl-4' : '';

    let subtasksHtml = '';
    if (hasSubtasks) {
        subtasksHtml = '<div class="space-y-2 mt-2">';
        task.subtasks.forEach(sub => {
            subtasksHtml += renderTaskNode(sub, depth + 1);
        });
        subtasksHtml += '</div>';
    }

    const safeId = task.id;
    const safeText = escapeHtml(task.text);
    const escapedForPrompt = task.text.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
        <div class="task-node ${indentClass}" data-id="${safeId}">
            <div class="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all hover:shadow-md group">
                <div class="flex items-center gap-3 flex-grow min-w-0">
                    <button type="button" onclick="toggleTask('${safeId}')" class="w-5 h-5 rounded-lg flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-300 hover:border-indigo-500 bg-white'}">
                        ${task.completed ? '<i class="fa-solid fa-check text-[10px] font-bold"></i>' : ''}
                    </button>
                    <span class="text-xs sm:text-sm text-slate-700 font-medium flex-grow truncate ${task.completed ? 'line-through text-slate-400' : ''}">
                        ${safeText}
                    </span>
                    <div class="hidden sm:flex items-center gap-2">
                        ${dateBadge}
                        ${priorityBadge}
                    </div>
                </div>
                <div class="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onclick="promptAddSubtask('${safeId}')" title="Добавить подзадачу" class="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                    <button type="button" onclick="promptEditTask('${safeId}', '${escapedForPrompt}')" title="Редактировать" class="p-1.5 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button type="button" onclick="toggleHideTask('${safeId}')" title="Спрятать в архив" class="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <i class="fa-solid fa-eye-slash text-xs"></i>
                    </button>
                    <button type="button" onclick="deleteTask('${safeId}')" title="Удалить" class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
            ${subtasksHtml}
        </div>
    `;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function promptAddSubtask(parentId) {
    const text = prompt('Введите подзадачу:');
    if (text && text.trim() !== '') {
        const dateVal = prompt('Дата начала (ГГГГ-ММ-ДД):', new Date().toISOString().split('T')[0]);
        const endDateVal = prompt('Дата окончания (ГГГГ-ММ-ДД):', dateVal || new Date().toISOString().split('T')[0]);
        addTask(parentId, text, 'medium', dateVal || new Date().toISOString().split('T')[0], endDateVal || dateVal);
    }
}

function promptEditTask(id, currentText) {
    const newText = prompt('Редактировать задачу:', currentText);
    if (newText !== null) {
        editTaskText(id, newText);
    }
}

function toggleHiddenPanel() {
    showHiddenPanelState = !showHiddenPanelState;
    const panel = document.getElementById('hiddenPanel');
    if (panel) {
        if (showHiddenPanelState) {
            panel.classList.remove('hidden-el');
            renderHiddenTasks();
        } else {
            panel.classList.add('hidden-el');
        }
    }
}

function renderHiddenTasks() {
    const container = document.getElementById('hiddenTasksList');
    if (!container) return;
    let hiddenItems = [];

    function collectHidden(items) {
        items.forEach(item => {
            if (item.hidden) hiddenItems.push(item);
            if (item.subtasks && item.subtasks.length > 0) collectHidden(item.subtasks);
        });
    }
    collectHidden(getActiveTasks());

    if (hiddenItems.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-3">Нет спрятанных задач в этом проекте</p>';
        return;
    }

    let html = '';
    hiddenItems.forEach(item => {
        html += `
            <div class="glass-panel p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                <span class="text-slate-600 font-medium truncate">${escapeHtml(item.text)}</span>
                <div class="flex items-center gap-1">
                    <button type="button" onclick="toggleHideTask('${item.id}')" class="px-2 py-1 bg-white rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 shadow-sm">Вернуть</button>
                    <button type="button" onclick="deleteTask('${item.id}')" class="p-1 text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function changeCalendarMonth(direction) {
    calendarMonth += direction;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    } else if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendar();
}

function renderCalendar() {
    const titleEl = document.getElementById('calendarMonthTitle');
    if (titleEl) {
        titleEl.innerText = `${monthNames[calendarMonth]} ${calendarYear}`;
    }
    const gridEl = document.getElementById('calendarDaysGrid');
    if (!gridEl) return;
    
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    let startIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    let taskSpans = [];
    function collectSpans(items) {
        items.forEach(item => {
            if (item.date && !item.hidden) {
                const start = new Date(item.date);
                const end = new Date(item.endDate || item.date);
                taskSpans.push({ start, end, text: item.text, completed: item.completed });
            }
            if (item.subtasks && item.subtasks.length > 0) collectSpans(item.subtasks);
        });
    }
    collectSpans(getActiveTasks());

    let html = '';
    for (let i = 0; i < startIndex; i++) {
        html += `<div></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
        const mStr = String(calendarMonth + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        const dateStr = `${calendarYear}-${mStr}-${dStr}`;
        const currDateObj = new Date(dateStr);
        const isSelected = selectedDateStr === dateStr;

        const activeSpans = taskSpans.filter(ts => currDateObj >= new Date(ts.start.toDateString()) && currDateObj <= new Date(ts.end.toDateString()));
        const hasSpan = activeSpans.length > 0;
        const isSpanStart = activeSpans.some(ts => currDateObj.toDateString() === ts.start.toDateString());
        const isSpanEnd = activeSpans.some(ts => currDateObj.toDateString() === ts.end.toDateString());

        let btnClass = "h-9 mx-auto rounded-xl flex flex-col items-center justify-center text-xs transition-all relative w-full ";
        if (isSelected) {
            btnClass += "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20 z-20 ";
        } else if (hasSpan) {
            btnClass += "bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200/80 hover:bg-indigo-100 ";
        } else {
            btnClass += "text-slate-600 hover:bg-slate-100 ";
        }

        html += `
            <button type="button" onclick="selectDate('${dateStr}')" class="${btnClass}">
                <span>${day}</span>
                ${hasSpan && !isSelected ? `
                    <div class="w-full flex items-center justify-center mt-0.5 px-0.5">
                        <div class="h-1 bg-indigo-500 rounded-full w-full ${isSpanStart ? 'rounded-l-full' : ''} ${isSpanEnd ? 'rounded-r-full' : ''}"></div>
                    </div>
                ` : ''}
            </button>
        `;
    }

    gridEl.innerHTML = html;
    renderSelectedDateTasks();
}

function selectDate(dateStr) {
    selectedDateStr = dateStr;
    renderCalendar();
}

function renderSelectedDateTasks() {
    const headerEl = document.getElementById('selectedDateHeader');
    if (headerEl) {
        headerEl.innerHTML = `<i class="fa-solid fa-calendar-day text-indigo-600"></i> Задачи на ${selectedDateStr}`;
    }
    const container = document.getElementById('selectedDateTasksList');
    if (!container) return;
    
    let matched = [];
    const targetDate = new Date(selectedDateStr);
    function findMatched(items) {
        items.forEach(item => {
            if (item.date && !item.hidden) {
                const start = new Date(item.date);
                const end = new Date(item.endDate || item.date);
                if (targetDate >= new Date(start.toDateString()) && targetDate <= new Date(end.toDateString())) {
                    matched.push(item);
                }
            }
            if (item.subtasks && item.subtasks.length > 0) findMatched(item.subtasks);
        });
    }
    findMatched(getActiveTasks());

    if (matched.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Нет запланированных задач на этот день</p>';
        return;
    }

    let html = '';
    matched.forEach(item => {
        html += `
            <div class="glass-panel p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div class="flex flex-col truncate">
                    <span class="text-slate-700 font-medium truncate ${item.completed ? 'line-through text-slate-400' : ''}">${escapeHtml(item.text)}</span>
                    <span class="text-[9px] text-slate-400">${item.date} &rarr; ${item.endDate || item.date}</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold ${item.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
                    ${item.completed ? 'Готово' : 'В работе'}
                </span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderTimeline() {
    const container = document.getElementById('ganttChartArea');
    if (!container) return;
    
    let flatList = [];
    function flatten(items, parentName = '') {
        items.forEach(item => {
            if (!item.hidden && !item.completed) {
                flatList.push({
                    ...item,
                    parentName
                });
                if (item.subtasks && item.subtasks.length > 0) {
                    flatten(item.subtasks, item.text);
                }
            }
        });
    }
    flatten(getActiveTasks());

    if (flatList.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-12">Нет активных задач в процессе для отображения на таймлайне</p>';
        return;
    }

    let allTimes = [];
    flatList.forEach(t => {
        allTimes.push(new Date(t.date || new Date().toISOString().split('T')[0]).getTime());
        allTimes.push(new Date(t.endDate || t.date || new Date().toISOString().split('T')[0]).getTime());
    });

    let minTime = Math.min(...allTimes);
    let maxTime = Math.max(...allTimes);

    if (maxTime - minTime < 86400000 * 5) {
        maxTime = minTime + 86400000 * 10;
        minTime = minTime - 86400000 * 2;
    } else {
        minTime -= 86400000 * 2;
        maxTime += 86400000 * 3;
    }

    const totalSpan = maxTime - minTime;

    let tickCount = 6;
    let ticksHtml = '';
    let dateAxisLineHtml = '';
    for (let i = 0; i <= tickCount; i++) {
        let tickTime = minTime + (totalSpan / tickCount) * i;
        let tickDateStr = new Date(tickTime).toISOString().split('T')[0];
        let percent = (i / tickCount) * 100;
        ticksHtml += `<span class="absolute transform -translate-x-1/2 text-[10px] text-slate-400 font-semibold" style="left: ${percent}%;">${tickDateStr}</span>`;
        dateAxisLineHtml += `<div class="absolute top-0 bottom-0 border-r border-slate-200/60 pointer-events-none" style="left: ${percent}%;"></div>`;
    }

    let html = `
        <div class="relative h-7 border-b border-slate-200 mb-4 px-2">
            ${ticksHtml}
        </div>
        <div class="relative space-y-3 flex-grow pb-2">
            ${dateAxisLineHtml}
    `;

    flatList.forEach(item => {
        const startTime = new Date(item.date || new Date().toISOString().split('T')[0]).getTime();
        const endTime = new Date(item.endDate || item.date || new Date().toISOString().split('T')[0]).getTime();
        
        let leftPercent = Math.max(0, Math.min(95, ((startTime - minTime) / totalSpan) * 100));
        let rightPercent = Math.max(5, Math.min(100, ((endTime - minTime) / totalSpan) * 100));
        let widthPercent = Math.max(4, rightPercent - leftPercent);

        let barColor = 'bg-indigo-600';

        html += `
            <div class="glass-panel p-3 rounded-2xl grid grid-cols-12 items-center gap-4 relative z-10">
                <div class="col-span-12 sm:col-span-4 flex flex-col min-w-0 pr-2">
                    <span class="text-xs font-bold text-slate-800 truncate">${escapeHtml(item.text)}</span>
                    <div class="flex items-center gap-2 mt-0.5">
                        ${item.parentName ? '<span class="text-[10px] text-slate-400 truncate">Родитель: ' + escapeHtml(item.parentName) + '</span>' : ''}
                        <span class="text-[9px] text-indigo-600 font-semibold">${item.date} &rarr; ${item.endDate || item.date}</span>
                    </div>
                </div>

                <div class="col-span-12 sm:col-span-8 relative">
                    <div class="w-full bg-slate-100/80 rounded-full h-4 relative overflow-hidden shadow-inner">
                        <div class="absolute h-full rounded-full ${barColor} transition-all duration-500 shadow-sm flex items-center px-2" style="left: ${leftPercent}%; width: ${widthPercent}%;">
                            <span class="text-[9px] text-white font-bold truncate">${item.text}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function switchTab(tab) {
    currentTab = tab;
    const tasksView = document.getElementById('tasksViewContainer');
    const timelineView = document.getElementById('timelineViewContainer');
    const tasksBtn = document.getElementById('tabTasksBtn');
    const timelineBtn = document.getElementById('tabTimelineBtn');

    if (!tasksView || !timelineView || !tasksBtn || !timelineBtn) return;

    if (tab === 'tasks') {
        tasksView.classList.remove('hidden-el');
        timelineView.classList.add('hidden-el');
        tasksBtn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition-all shadow-sm";
        timelineBtn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-all";
    } else {
        tasksView.classList.add('hidden-el');
        timelineView.classList.remove('hidden-el');
        timelineBtn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition-all shadow-sm";
        tasksBtn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-all";
        renderTimeline();
    }
}

function renderCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    const badgeEl = document.getElementById('currentProjectTitleBadge');
    if (!container || !badgeEl) return;

    let html = '';
    for (const key in projectsData) {
        const proj = projectsData[key];
        const isActive = key === currentCategory;
        const btnClass = isActive 
            ? "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm transition-all"
            : "px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/80 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-all";
        
        html += `<button type="button" onclick="switchCategory('${key}')" class="${btnClass}">${proj.name}</button>`;
    }
    container.innerHTML = html;
    badgeEl.innerText = `Проект: ${projectsData[currentCategory].name}`;
}

function renderAll() {
    renderCategoryTabs();
    const taskListEl = document.getElementById('taskList');
    const emptyStateEl = document.getElementById('emptyState');
    if (!taskListEl || !emptyStateEl) return;

    const activeTasks = getActiveTasks();
    let filteredTasks = activeTasks;
    if (currentFilter === 'active') {
        filteredTasks = activeTasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = activeTasks.filter(t => t.completed);
    }

    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        function filterRecursive(list) {
            return list.filter(item => {
                const matches = item.text.toLowerCase().includes(query);
                if (item.subtasks && item.subtasks.length > 0) {
                    item.subtasks = filterRecursive(item.subtasks);
                    if (item.subtasks.length > 0) return true;
                }
                return matches;
            });
        }
        filteredTasks = filterRecursive(JSON.parse(JSON.stringify(activeTasks)));
    }

    if (activeTasks.length === 0) {
        taskListEl.innerHTML = '';
        emptyStateEl.classList.remove('hidden');
    } else {
        emptyStateEl.classList.add('hidden');
        let html = '';
        filteredTasks.forEach(task => {
            html += renderTaskNode(task, 0);
        });
        taskListEl.innerHTML = html || '<p class="text-center text-slate-400 text-xs py-8">Ничего не найдено</p>';
    }

    const stats = calculateStats(activeTasks);
    document.getElementById('statTotal').innerText = stats.total;
    document.getElementById('statPending').innerText = stats.pending;
    document.getElementById('statCompleted').innerText = stats.completed;
    document.getElementById('statProgress').innerText = stats.progress + '%';

    const badge = document.getElementById('hiddenCountBadge');
    if (badge) {
        if (stats.hiddenCount > 0) {
            badge.innerText = stats.hiddenCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    renderCalendar();
    if (currentTab === 'timeline') renderTimeline();
}

const taskFormEl = document.getElementById('taskForm');
if (taskFormEl) {
    taskFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('taskInput');
        const dateInput = document.getElementById('taskDateInput');
        const priority = document.getElementById('taskPriority').value;
        const startStr = dateInput.value || new Date().toISOString().split('T')[0];
        const endStr = prompt('Дата окончания задачи (ГГГГ-ММ-ДД):', startStr) || startStr;
        addTask(null, input.value, priority, startStr, endStr);
        input.value = '';
    });
}

const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
    searchInputEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderAll();
    });
}

const seasonSelectEl = document.getElementById('seasonSelect');
if (seasonSelectEl) {
    seasonSelectEl.value = currentSeasonSetting;
    seasonSelectEl.addEventListener('change', (e) => {
        currentSeasonSetting = e.target.value;
        localStorage.setItem('auratask_season', currentSeasonSetting);
        updateSeasonTheme();
        initParticles();
    });
}

const filterAllEl = document.getElementById('filterAll');
if (filterAllEl) {
    filterAllEl.addEventListener('click', () => {
        currentFilter = 'all';
        document.getElementById('activeFilterLabel').innerText = 'Все';
        renderAll();
    });
}

const filterActiveEl = document.getElementById('filterActive');
if (filterActiveEl) {
    filterActiveEl.addEventListener('click', () => {
        currentFilter = 'active';
        document.getElementById('activeFilterLabel').innerText = 'Активные';
        renderAll();
    });
}

const filterCompletedEl = document.getElementById('filterCompleted');
if (filterCompletedEl) {
    filterCompletedEl.addEventListener('click', () => {
        currentFilter = 'completed';
        document.getElementById('activeFilterLabel').innerText = 'Готовые';
        renderAll();
    });
}

const clearCompletedBtnEl = document.getElementById('clearCompletedBtn');
if (clearCompletedBtnEl) {
    clearCompletedBtnEl.addEventListener('click', () => {
        function removeCompletedRecursive(list) {
            return list.filter(item => {
                if (item.subtasks && item.subtasks.length > 0) {
                    item.subtasks = removeCompletedRecursive(item.subtasks);
                }
                return !item.completed;
            });
        }
        projectsData[currentCategory].tasks = removeCompletedRecursive(getActiveTasks());
        saveProjects();
    });
}

window.onload = function() {
    const taskDateInputEl = document.getElementById('taskDateInput');
    if (taskDateInputEl) {
        taskDateInputEl.value = new Date().toISOString().split('T')[0];
    }
    updateSeasonTheme();
    renderAll();
};