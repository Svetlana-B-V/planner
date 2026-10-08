// Инициализация данных проектов. Загружаем из localStorage или используем дефолтные
let projectsData = JSON.parse(localStorage.getItem('auratask_projects')) || {
    work: {
        name: '💼 Работа',
        tasks: [
            { id: 'w_1', text: 'Рефакторинг архитектуры', completed: false, priority: 'high', color: '#6366f1', date: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], hidden: false, subtasks: [] }
        ]
    }
};

let currentCategory = Object.keys(projectsData)[0] || 'work';
let currentFilter = 'all';
let searchQuery = '';
let currentSeasonSetting = localStorage.getItem('auratask_season') || 'auto';
let currentTab = 'tasks';
let showHiddenPanelState = false;

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedDateStr = new Date().toISOString().split('T')[0];

// --- Анимация фона (Частицы и Сезоны) ---
function getAutoSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

function getActiveSeason() { return currentSeasonSetting === 'auto' ? getAutoSeason() : currentSeasonSetting; }

function updateSeasonTheme() {
    const bgEl = document.getElementById('seasonBg');
    if (bgEl) bgEl.className = 'season-bg season-' + getActiveSeason();
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
    constructor() { this.reset(); }
    reset() {
        const season = getActiveSeason();
        this.x = canvas ? Math.random() * canvas.width : 0;
        this.y = canvas ? Math.random() * (season === 'spring' ? canvas.height : -canvas.height) : 0;
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
            if (this.y > canvas.height + 10 || this.x > canvas.width + 10 || this.x < -10) { this.y = -10; this.x = Math.random() * canvas.width; }
        } else {
            this.y += this.speedY;
            this.x += this.speedX + (season === 'autumn' ? 0.6 : 0);
            this.rotation += this.rotSpeed;
            if (this.y > canvas.height + 10 || this.x > canvas.width + 10 || this.x < -10) { this.reset(); this.y = -10; }
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
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2); ctx.fill();
        } else if (season === 'autumn') {
            ctx.fillStyle = Math.random() > 0.5 ? '#d97706' : '#ea580c'; ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 0.7);
        } else if (season === 'summer') {
            ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

function initParticles() {
    if (!canvas) return;
    particles = Array.from({length: 40}, () => { const p = new Particle(); p.y = Math.random() * canvas.height; return p; });
}
function animateParticles() {
    if (ctx && canvas) { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); }
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

// --- Логика задач ---
function saveProjects() { localStorage.setItem('auratask_projects', JSON.stringify(projectsData)); renderAll(); }
function getActiveTasks() { return projectsData[currentCategory]?.tasks || []; }

function promptAddCategory() {
    const name = prompt('Введите название нового проекта / категории:');
    if (name && name.trim() !== '') {
        const key = 'proj_' + Math.random().toString(36).substr(2, 6);
        projectsData[key] = { name: name.trim(), tasks: [] };
        currentCategory = key;
        saveProjects();
    }
}

function findTaskAndMutate(taskList, id, callback) {
    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].id === id) return callback(taskList, i);
        if (taskList[i].subtasks && findTaskAndMutate(taskList[i].subtasks, id, callback)) return true;
    }
}

// Быстрое добавление задачи (на сегодня)
function addQuickTask() {
    const input = document.getElementById('quickTaskInput');
    if(!input.value.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    addTask(null, input.value, 'medium', today, today, '#6366f1');
    input.value = '';
}

function addTask(parentId, text, priority, dateStr, endDateStr, colorHex) {
    if (!text || text.trim() === '') return;
    const start = dateStr || new Date().toISOString().split('T')[0];
    const end = endDateStr || start;
    const newTask = {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        text: text.trim(), completed: false, priority: priority || 'medium',
        date: start, endDate: end < start ? start : end, color: colorHex || '#6366f1',
        hidden: false, subtasks: []
    };

    const taskList = getActiveTasks();
    if (!parentId) taskList.push(newTask);
    else findTaskAndMutate(taskList, parentId, (list, index) => {
        if (!list[index].subtasks) list[index].subtasks = [];
        list[index].subtasks.push(newTask); return true;
    });
    saveProjects();
}

function toggleTask(id) { findTaskAndMutate(getActiveTasks(), id, (l, i) => { l[i].completed = !l[i].completed; return true; }); saveProjects(); }
function toggleHideTask(id) { findTaskAndMutate(getActiveTasks(), id, (l, i) => { l[i].hidden = !l[i].hidden; return true; }); saveProjects(); }
function deleteTask(id) { findTaskAndMutate(getActiveTasks(), id, (l, i) => { l.splice(i, 1); return true; }); saveProjects(); }

// --- Работа с модальным окном (Детальное создание / редактирование) ---
function openTaskModal(isEdit, taskId, parentId, currentData) {
    const modal = document.getElementById('taskActionModal');
    document.getElementById('modalActionTitleText').textContent = isEdit ? 'Редактировать задачу' : (parentId ? 'Новая подзадача' : 'Новая задача');
    document.getElementById('modalTaskId').value = isEdit ? taskId : '';
    document.getElementById('modalParentId').value = !isEdit ? (parentId || '') : '';
    
    document.getElementById('modalTaskName').value = currentData?.text || '';
    document.getElementById('modalTaskStart').value = currentData?.date || new Date().toISOString().split('T')[0];
    document.getElementById('modalTaskEnd').value = currentData?.endDate || document.getElementById('modalTaskStart').value;
    document.getElementById('modalTaskPriority').value = currentData?.priority || 'medium';
    document.getElementById('modalTaskColor').value = currentData?.color || '#6366f1';
    
    modal.classList.remove('hidden-el');
}

function closeTaskModal() { document.getElementById('taskActionModal').classList.add('hidden-el'); }

// Обработка формы модального окна
document.getElementById('modalActionForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modalTaskId').value;
    const parentId = document.getElementById('modalParentId').value;
    const text = document.getElementById('modalTaskName').value;
    const start = document.getElementById('modalTaskStart').value;
    let end = document.getElementById('modalTaskEnd').value;
    if (end < start) end = start; // Защита от неправильного ввода дат
    const prio = document.getElementById('modalTaskPriority').value;
    const color = document.getElementById('modalTaskColor').value;

    if (id) {
        findTaskAndMutate(getActiveTasks(), id, (list, idx) => {
            list[idx].text = text; list[idx].date = start; list[idx].endDate = end; 
            list[idx].priority = prio; list[idx].color = color; return true;
        });
        saveProjects();
    } else {
        addTask(parentId || null, text, prio, start, end, color);
    }
    closeTaskModal();
});

// Автоматическая корректировка конечной даты, чтобы она не могла быть раньше начальной
const modalTaskStart = document.getElementById('modalTaskStart');
const modalTaskEnd = document.getElementById('modalTaskEnd');
if(modalTaskStart && modalTaskEnd) {
    modalTaskStart.addEventListener('change', () => { if(modalTaskEnd.value < modalTaskStart.value) modalTaskEnd.value = modalTaskStart.value; });
}

// --- Отрисовка интерфейса ---
function renderTaskNode(task, depth) {
    if (task.hidden) return '';
    let badgeColor = task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100';
    const prioStr = task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий';
    const priorityBadge = `<span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${badgeColor} border">${prioStr}</span>`;
    
    // Красивый бейдж с отображением цвета задачи и периода дат
    const dateBadge = `<span class="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${task.color || '#6366f1'}"></span>${task.date}${task.endDate && task.endDate !== task.date ? ' &rarr; ' + task.endDate : ''}</span>`;
    
    let subtasksHtml = task.subtasks?.length ? `<div class="space-y-2 mt-2">${task.subtasks.map(s => renderTaskNode(s, depth + 1)).join('')}</div>` : '';
    const safeText = task.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeData = JSON.stringify(task).replace(/"/g, '&quot;');

    return `
        <div class="task-node ${depth > 0 ? 'ml-4 sm:ml-6 mt-2 border-l-2 border-indigo-100 pl-3 sm:pl-4' : ''}">
            <div class="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all hover:shadow-md group">
                <div class="flex items-center gap-3 flex-grow min-w-0">
                    <button type="button" onclick="toggleTask('${task.id}')" class="w-5 h-5 rounded-lg flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-300 hover:border-indigo-500 bg-white'}">
                        ${task.completed ? '<i class="fa-solid fa-check text-[10px] font-bold"></i>' : ''}
                    </button>
                    <span class="text-xs sm:text-sm text-slate-700 font-medium flex-grow truncate ${task.completed ? 'line-through text-slate-400' : ''}">${safeText}</span>
                    <div class="hidden sm:flex items-center gap-2">${dateBadge}${priorityBadge}</div>
                </div>
                <div class="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onclick="openTaskModal(false, null, '${task.id}')" title="Добавить подзадачу" class="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"><i class="fa-solid fa-plus text-xs"></i></button>
                    <button type="button" onclick="openTaskModal(true, '${task.id}', null, ${safeData})" title="Редактировать" class="p-1.5 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-pink-600"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button type="button" onclick="toggleHideTask('${task.id}')" title="В архив" class="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600"><i class="fa-solid fa-eye-slash text-xs"></i></button>
                    <button type="button" onclick="deleteTask('${task.id}')" title="Удалить" class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div>
            ${subtasksHtml}
        </div>`;
}

function renderTimeline() {
    const container = document.getElementById('ganttChartArea');
    if (!container) return;
    
    let flatList = [];
    function flatten(items, parentName = '') {
        items.forEach(item => {
            if (!item.hidden && !item.completed) { flatList.push({...item, parentName}); if (item.subtasks) flatten(item.subtasks, item.text); }
        });
    }
    flatten(getActiveTasks());

    if (flatList.length === 0) { container.innerHTML = '<p class="text-xs text-slate-400 text-center py-12">Нет активных задач</p>'; return; }

    // Определяем временные границы для графика
    let allTimes = flatList.flatMap(t => [new Date(t.date).getTime(), new Date(t.endDate || t.date).getTime()]);
    let minTime = Math.min(...allTimes); let maxTime = Math.max(...allTimes);
    if (maxTime - minTime < 86400000 * 5) { maxTime += 86400000 * 8; minTime -= 86400000 * 2; } 
    else { minTime -= 86400000 * 2; maxTime += 86400000 * 3; }
    const totalSpan = maxTime - minTime;

    let ticksHtml = '', dateAxisLineHtml = '';
    for (let i = 0; i <= 6; i++) {
        let pct = (i / 6) * 100;
        ticksHtml += `<span class="absolute transform -translate-x-1/2 text-[10px] text-slate-400 font-semibold" style="left: ${pct}%;">${new Date(minTime + (totalSpan/6)*i).toISOString().split('T')[0]}</span>`;
        dateAxisLineHtml += `<div class="absolute top-0 bottom-0 border-r border-slate-200/60 pointer-events-none" style="left: ${pct}%;"></div>`;
    }

    let html = `<div class="relative h-7 border-b border-slate-200 mb-4 px-2">${ticksHtml}</div><div class="relative space-y-3 flex-grow pb-2">${dateAxisLineHtml}`;

    // Рендерим каждую полоску задачи с учетом её уникального цвета
    flatList.forEach(item => {
        let leftPercent = Math.max(0, Math.min(95, ((new Date(item.date).getTime() - minTime) / totalSpan) * 100));
        let rightPercent = Math.max(5, Math.min(100, ((new Date(item.endDate || item.date).getTime() - minTime) / totalSpan) * 100));
        let widthPercent = Math.max(4, rightPercent - leftPercent);
        let barColor = item.color || '#6366f1';

        html += `
            <div class="glass-panel p-3 rounded-2xl grid grid-cols-12 items-center gap-4 relative z-10">
                <div class="col-span-12 sm:col-span-4 flex flex-col min-w-0 pr-2">
                    <span class="text-xs font-bold text-slate-800 truncate">${item.text}</span>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[9px] font-semibold" style="color: ${barColor}">${item.date} &rarr; ${item.endDate || item.date}</span>
                    </div>
                </div>
                <div class="col-span-12 sm:col-span-8 relative">
                    <div class="w-full bg-slate-100/80 rounded-full h-4 relative overflow-hidden shadow-inner">
                        <div class="absolute h-full rounded-full transition-all duration-500 shadow-sm flex items-center px-2" style="background-color: ${barColor}; left: ${leftPercent}%; width: ${widthPercent}%;">
                            <span class="text-[9px] text-white font-bold truncate">${item.text}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html + `</div>`;
}

function renderCalendar() {
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const startIndex = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7; 
    document.getElementById('calendarMonthTitle').innerText = `${["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"][calendarMonth]} ${calendarYear}`;
    
    let taskSpans = [];
    function collectSpans(items) { items.forEach(i => { if(i.date && !i.hidden) taskSpans.push({...i, s: new Date(i.date), e: new Date(i.endDate||i.date)}); if(i.subtasks) collectSpans(i.subtasks); }); }
    collectSpans(getActiveTasks());

    let html = Array(startIndex).fill('<div></div>').join('');
    for (let day = 1; day <= totalDays; day++) {
        const dStr = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const cDate = new Date(dStr);
        const spans = taskSpans.filter(ts => cDate >= new Date(ts.s.toDateString()) && cDate <= new Date(ts.e.toDateString()));
        const isSelected = selectedDateStr === dStr;
        
        let classes = `h-9 mx-auto rounded-xl flex flex-col items-center justify-center text-xs transition-all relative w-full ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md z-20' : spans.length ? 'bg-indigo-50 text-indigo-800 font-semibold hover:bg-indigo-100' : 'text-slate-600 hover:bg-slate-100'}`;
        let indicator = '';
        if (spans.length && !isSelected) {
            const domColor = spans[0].color || '#6366f1';
            const isStart = spans.some(ts => cDate.toDateString() === ts.s.toDateString());
            const isEnd = spans.some(ts => cDate.toDateString() === ts.e.toDateString());
            indicator = `<div class="w-full px-0.5 mt-0.5 flex items-center justify-center"><div class="h-1 w-full ${isStart?'rounded-l-full':''} ${isEnd?'rounded-r-full':''}" style="background-color: ${domColor}"></div></div>`;
        }
        html += `<button onclick="selectDate('${dStr}')" class="${classes}"><span>${day}</span>${indicator}</button>`;
    }
    document.getElementById('calendarDaysGrid').innerHTML = html;
    renderSelectedDateTasks();
}

function renderSelectedDateTasks() {
    document.getElementById('selectedDateBadge').textContent = selectedDateStr;
    const targetDate = new Date(selectedDateStr);
    let matched = [];
    function find(items) { items.forEach(i => { if(!i.hidden && targetDate >= new Date(new Date(i.date).toDateString()) && targetDate <= new Date(new Date(i.endDate||i.date).toDateString())) matched.push(i); if(i.subtasks) find(i.subtasks); }); }
    find(getActiveTasks());
    
    document.getElementById('selectedDateTasksList').innerHTML = matched.length ? matched.map(i => `
        <div class="glass-panel p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs border-l-4" style="border-color: ${i.color || '#6366f1'}">
            <div class="flex flex-col truncate">
                <span class="text-slate-700 font-medium truncate ${i.completed?'line-through':''}">${i.text}</span>
            </div>
        </div>`).join('') : '<p class="text-xs text-slate-400 text-center py-6">Задач нет</p>';
}

function changeCalendarMonth(dir) { calendarMonth += dir; if(calendarMonth>11){calendarMonth=0;calendarYear++;} else if(calendarMonth<0){calendarMonth=11;calendarYear--;} renderCalendar(); }
function selectDate(d) { selectedDateStr = d; renderCalendar(); }
function switchTab(t) { currentTab = t; document.getElementById('tasksViewContainer').classList.toggle('hidden-el', t!=='tasks'); document.getElementById('timelineViewContainer').classList.toggle('hidden-el', t!=='timeline'); renderAll(); }
function switchCategory(k) { currentCategory = k; renderAll(); }
function filterByStat(f) { currentFilter = f === 'pending' ? 'active' : f; switchTab('tasks'); renderAll(); }
function openProgressModal() { document.getElementById('progressModal').classList.remove('hidden-el'); }
function closeProgressModal() { document.getElementById('progressModal').classList.add('hidden-el'); }
function toggleHiddenPanel() { showHiddenPanelState = !showHiddenPanelState; document.getElementById('hiddenPanel').classList.toggle('hidden-el', !showHiddenPanelState); if(showHiddenPanelState) renderHiddenTasks(); }

function renderHiddenTasks() {
    let hid = []; function col(it) { it.forEach(i => { if(i.hidden) hid.push(i); if(i.subtasks) col(i.subtasks); }); } col(getActiveTasks());
    document.getElementById('hiddenTasksList').innerHTML = hid.length ? hid.map(i => `<div class="glass-panel p-2.5 rounded-xl flex items-center justify-between text-xs"><span class="truncate">${i.text}</span><button onclick="toggleHideTask('${i.id}')" class="text-indigo-600 hover:underline">Вернуть</button></div>`).join('') : '<p class="text-xs text-center py-2 text-slate-400">Пусто</p>';
}

function renderAll() {
    document.getElementById('categoryTabs').innerHTML = Object.keys(projectsData).map(k => `<button onclick="switchCategory('${k}')" class="${k===currentCategory ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'} px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm">${projectsData[k].name}</button>`).join('');
    document.getElementById('currentProjectTitleBadge').innerText = `Проект: ${projectsData[currentCategory]?.name || ''}`;
    
    let activeTasks = getActiveTasks();
    let filtered = activeTasks;
    if(currentFilter==='active') filtered = activeTasks.filter(t => !t.completed);
    else if(currentFilter==='completed') filtered = activeTasks.filter(t => t.completed);
    
    if(searchQuery) {
        const q = searchQuery.toLowerCase();
        const fReq = (list) => list.filter(i => { const m = i.text.toLowerCase().includes(q); if(i.subtasks) { i.subtasks = fReq(i.subtasks); if(i.subtasks.length) return true; } return m; });
        filtered = fReq(JSON.parse(JSON.stringify(activeTasks)));
    }
    
    document.getElementById('taskList').innerHTML = filtered.length ? filtered.map(t => renderTaskNode(t, 0)).join('') : '';
    document.getElementById('emptyState').classList.toggle('hidden', activeTasks.length > 0);
    
    let tot=0, cmp=0;
    const calc = (it) => it.forEach(i => { tot++; if(i.completed) cmp++; if(i.subtasks) calc(i.subtasks); });
    calc(activeTasks);
    document.getElementById('statTotal').innerText = tot; document.getElementById('statCompleted').innerText = cmp; document.getElementById('statPending').innerText = tot - cmp;
    const pct = tot ? Math.round((cmp/tot)*100) : 0; document.getElementById('statProgress').innerText = pct + '%';
    document.getElementById('modalProgressPercent').innerText = pct + '%'; document.getElementById('modalCircleProgress').setAttribute('stroke-dasharray', `${pct}, 100`);

    renderCalendar(); if(currentTab==='timeline') renderTimeline();
}

document.getElementById('searchInput')?.addEventListener('input', e => { searchQuery = e.target.value; renderAll(); });
document.getElementById('seasonSelect')?.addEventListener('change', e => { currentSeasonSetting = e.target.value; localStorage.setItem('auratask_season', currentSeasonSetting); updateSeasonTheme(); initParticles(); });
document.getElementById('clearCompletedBtn')?.addEventListener('click', () => { projectsData[currentCategory].tasks = projectsData[currentCategory].tasks.filter(t => !t.completed); saveProjects(); });

window.onload = () => { 
    if(document.getElementById('seasonSelect')) document.getElementById('seasonSelect').value = currentSeasonSetting;
    updateSeasonTheme(); renderAll(); 
};