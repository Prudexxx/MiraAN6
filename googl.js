/ ===================== GOOGLE SHEETS ОТПРАВКА =====================
const SCRIPT_URL1 = 'https://script.google.com/macros/s/AKfycbxD4z2D5w3xQ17h5z0wxtVmhplzdey6hJmw0TaAhk64qG3NBG4J1k6GWYegy2u6Dq9M_A/exec';

function showToast(message, isError = false) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.style.cssText = 'position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:#333; color:#ffd966; padding:12px 24px; border-radius:40px; z-index:99999; border:2px solid #ffd966; font-size:14px; white-space:nowrap;';
        document.body.appendChild(toast);
    }
    toast.style.background = isError ? '#8B0000' : '#1e7a4a';
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function setupGoogleSender() {
    const form = document.getElementById('telegramForm');
    const messageInput = document.getElementById('message');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) {
            showToast('❌ Введите текст перед отправкой', true);
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Отправка...';
        submitBtn.disabled = true;
        
        try {
            await fetch(SCRIPT_URL1, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    timestamp: new Date().toLocaleString('ru-RU')
                })
            });
            showToast('✅ Сообщение отправлено в Google Таблицу!');
            messageInput.value = '';
        } catch (error) {
            console.error('Ошибка:', error);
            showToast('❌ Ошибка отправки', true);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===================== ЕЖЕДНЕВНИК (ВСТРОЕННЫЙ, БЕЗ ВНЕШНИХ ФАЙЛОВ) =====================



// ===================== ОСТАЛЬНЫЕ ФУНКЦИИ =====================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6SY0kxfrDvX1u61BpLXjL-KFeGOIIQ5Du0qy0SU_bVa09kW-PlbFuKOhLuJtdSZkNWA/exec';
const LOCK_PASSWORD = '777';
let isEditMode = false;
let servicesData = {};
let eventsData = {};
let serviceNamesData = {};

const defaultServiceNames = {
    "Ведущий": "Ведущий", "Чайханщик": "Чайханщик", "Уборщик": "Уборщик",
    "Закупщик": "Закупщик", "Спикерхантер": "Спикерхантер", "ПБУ": "ПБУ",
    "ПГО": "ПГО", "ПРЕДСЕДАТЕЛь": "ПРЕДСЕДАТЕЛь", "КАЗНАЧЕй": "КАЗНАЧЕй",
    "замПГО": "замПГО", "РС": "РС", "ПСО": "ПСО", "Литком": "Литком"
};

const serviceDetails = {
    "Ведущий": "1. Приходить на собрание не позднее, чем за 10 минут до начала собрания.\n2. Открывать помещение группы.\n3. Соблюдать основы ведения собрания.\n4. В тематические дни акцентировать внимание присутствующих на главной теме.\n5. В случае присутствия на группе новичка, акцентировать внимание присутствующих на том, что главная тема - Новичку.\n6. Уделять внимание новичкам после собрания и выдавать им бесплатную литературу.\n7. Вести учёт собранных в банку денег.\n8. Посещать все рабочие собрания группы МИРА.\n9. Представлять группе отчёт о проделанной работе.\n10. Следить за соблюдением правил ведения собрания.\n11. Пользоваться кубиком или прерывать высказывания.\n12. Заполнять «тетрадь для ведущего».\n13. Сообщать председателю группы о форс-мажорных обстоятельствах.\n14. Следить за порядком, чистотой после собрания.\n15. Мыть полы после собрания в отсутствие уборщика.\n16. Закрывать за собой помещение.\n17. Сообщать о своём уходе с должности не позднее, чем за одно рабочее собрание.\n18. Ведущий должен быть знаком со своими обязанностями до вступления в должность.\n\nВедущий на любой день недели избирается на 4 месяца.",
    "Чайханщик": "1. Поддерживать на группе наличие чая, сахара, печенья, питьевой воды.\n2. Во время собрания выставлять на стол кружки, ложки, блюдца, доставать чай, сахар, печенье, наливать чай всем желающим. Новичкам и гостям в первую очередь.\n3. Следить за чистотой кружек, блюдец и заварочного чайника.\n4. Посещать все рабочие собрания группы МИРА.\n5. Представлять группе отчёт о проделанной работе.\n6. Сообщать о своём уходе с должности.\n\nЧайханщик избирается сроком на 3 месяца.",
    "Уборщик": "1. Поддерживать на группе чистоту.\n2. Следить за чистотой полов, тряпок, ведер.\n3. Выносить мусор после группы.\n4. Посещать все рабочие собрания группы МИРА.\n5. Представлять группе отчёт о проделанной работе.\n6. Сообщать о своём уходе с должности.\n\nУборщик избирается сроком на 3 месяца.",
    "Закупщик": "1. Закупать на группу все нужды группы.\n2. Регулярная отчетность перед группой о закупках.\n3. Поддерживать на группе наличие всех нужд.\n4. Взаимодействовать с чайханщиками.\n5. Посещать все рабочие собрания.\n6. Сообщать о своём уходе.\n\nЗакупщик избирается сроком на 6 месяцев.",
    "Спикерхантер": "1. Обеспечить группу спикерской или семинаром.\n2. Давать информацию о мероприятиях заранее.\n3. Проговаривать со спикером о чистоте вести АН.\n4. Посещать все рабочие собрания.\n5. Найти спикера, который выздоравливает в АН.\n6. По запросу организовать онлайн спикерские.\n\nСпикерхантер избирается сроком на 6 месяцев.",
    "ПБУ": "В обязанности Представителя подкомитета Больницы и Учреждения (БУ) входит:\n1. Посещение всех собраний БУ.\n2. Регулярная отчетность перед группой.\n3. Донесение потребностей группы до подкомитета.\n4. Посещать все рабочие собрания группы.\n5. Сообщать о своём уходе.\n\nПредставитель БУ избирается сроком на 12 месяцев.",
    "ПГО": "В обязанности Представителя Группового Обслуживания (ПГО) входит:\n1. Посещение всех собраний ФПГ, МКО, региональных ассамблей.\n2. Активное участие в ФПГ, МКО.\n3. Регулярная отчетность перед группой.\n4. Донесение группового сознания до ФПГ, МКО.\n5. Поддерживать контакт с владельцем помещения.\n6. Приобретение литературы, жетонов.\n7. Сообщать о своём уходе.\n\nПГО избирается сроком на 12 месяцев.",
    "ПСО": "В обязанности Представителя подкомитета Связи с Общественностью (СО) входит:\n1. Посещение всех собраний СО.\n2. Регулярная отчетность перед группой.\n3. Донесение потребностей группы до подкомитета.\n4. Посещать все рабочие собрания.\n5. Сообщать о своём уходе.\n\nПредставитель СО избирается сроком на 12 месяцев.",
    "Литком": "В обязанности Представителя Литературного Комитета входит:\n1. Обеспечить группу литературой и сувенирной продукцией.\n2. Своевременно заказывать литературу.\n3. Организовать продажу литературы на группе.\n4. Посещать все рабочие собрания.\n5. Предоставлять отчет о проданной литературе.\n6. Бережно относиться к книгам.\n7. Посещать собрания подкомитета по литературе.\n\nПредставитель Литкома избирается сроком на 12 месяцев.",
    "КАЗНАЧЕй": "В обязанности КАЗНАЧЕЯ входит:\n1. Вести учет собранных денежных средств.\n2. Посещать все рабочие собрания.\n3. Перечислять деньги в Литком за литературу.\n4. Представлять отчет о проделанной работе.\n5. Считать денежные средства после собрания.\n6. Следить, чтоб собранные деньги не смешивались с личными.\n7. Перечислять взносы в МСО.\n\nКазначей избирается сроком на 12 месяцев.",
    "ПРЕДСЕДАТЕЛь": "В обязанности ПРЕДСЕДАТЕЛЯ входит:\n1. Посещать все рабочие собрания.\n2. Представлять отчет о проделанной работе.\n3. Проводить рабочие собрания.\n4. Поддерживать порядок и дисциплину.\n5. Формировать повестку на рабочем собрании.\n6. Поддерживать контакт с должностными лицами.\n7. Записывать, у кого и какие служения.\n8. Сообщать группе о вакансии служения.\n\nПредседатель избирается сроком на 12 месяцев.",
    "замПГО": "В обязанности Заместителя ПГО входит:\n1. Оказывать помощь ПГО.\n2. Посещение собраний ФПГ, МКО в отсутствие ПГО.\n3. Регулярная отчетность перед группой.\n4. Донесение группового сознания.\n5. Быть в курсе событий на местности.\n6. Проводить рабочее собрание в отсутствие Председателя и ПГО.\n\nЗам. ПГО избирается сроком на 12 месяцев.",
    "РС": "В обязанности Представителя подкомитета Развитие Сообщества (РС) входит:\n1. Посещение всех собраний РС.\n2. Регулярная отчетность перед группой.\n3. Донесение потребностей группы.\n4. Посещать все рабочие собрания.\n5. Сообщать о своём уходе.\n\nПредставитель РС избирается сроком на 12 месяцев."
};

const defaultEvents = {
    "ПН": " Понедельник\n\n🕡 Утро 10:00-11:00\nУл. Крылова 4, 4 этаж, офис 408\nЕжедневник, 11-й шаг, медитация\nУтренний кофе!\n\n🕡 Вечер 19:00-20:15\nЕжедневник, вопрос-ответ по шагам",
    "ВТ": " Вторник\n\n🕡 Утро 10:00-11:00\nЕжедневник, 11-й шаг, медитация\n\n🕡 Вечер 19:00-20:15\nНовый формат BLACKOUT\n\n🕡 Поздний вечер 21:00-22:00\nВопрос-ответ БЕЗ ЦЕНЗУРЫ \n\n🔗 Онлайн-подключение: https://telemost.yandex.ru/j/15060662537071",
    "СР": "Среда\n\n🕡 Утро 10:00-11:00\nЕжедневник, 11-й шаг, медитация\nУтреннее рабочее собрание!\nУтренний кофе!\n🕡 Вечер 19:00-20:15\nСеминар: «Как встречать новичка»",
    "ЧТ": " Пуэрный Четверг\n\n🕡 Утро 10:00-11:00\nЕжедневник, 11-й шаг, медитация\nУтренний кофе!\n🕡 Вечер 19:00-20:15\nБочонки\n20:30 - Рабочее собрание",
    "ПТ": "Пятница\n\n🕡 Утро 10:00-11:00\nЕжедневник, 11-й шаг, медитация\nУтренний кофе!\n🕡 Вечер 19:00-20:15\nИзучение литературы\n\n🔗 Онлайн-подключение: https://telemost.yandex.ru/j/15060662537071",
    "СБ": " Суббота\n\n🕡 16:00-17:15\nЕжедневник, свободная тема",
    "ВС": " Воскресенье\n\n🕡 14:00-15:15\nЕжедневник, самоанализ"
};

function loadFromLocal() {
    try {
        const saved = localStorage.getItem('mir_services_backup');
        if (saved) servicesData = JSON.parse(saved);
        const savedEvents = localStorage.getItem('mir_events_backup');
        if (savedEvents) eventsData = JSON.parse(savedEvents);
        const savedNames = localStorage.getItem('mir_names_backup');
        if (savedNames) serviceNamesData = JSON.parse(savedNames);
    } catch(e) {}
}

function saveToLocal() {
    localStorage.setItem('mir_services_backup', JSON.stringify(servicesData));
    localStorage.setItem('mir_events_backup', JSON.stringify(eventsData));
    localStorage.setItem('mir_names_backup', JSON.stringify(serviceNamesData));
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.toggle('active', show);
}

function loadFromCloud() {
    showLoading(true);
    const callbackName = 'jsonp_callback_' + Date.now();
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        if (data.services) servicesData = data.services;
        if (data.events) eventsData = data.events;
        if (data.serviceNames) serviceNamesData = data.serviceNames;
        saveToLocal();
        showToast('✅ Данные загружены из облака');
        showLoading(false);
        refreshAll();
    };
    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?callback=${callbackName}`;
    script.onerror = function() {
        delete window[callbackName];
        loadFromLocal();
        showToast('⚠️ Не удалось загрузить из облака, использованы локальные данные', true);
        showLoading(false);
        refreshAll();
    };
    document.body.appendChild(script);
}

function saveToCloud() {
    showLoading(true);
    const saves = [
        { type: 'services', data: servicesData },
        { type: 'events', data: eventsData },
        { type: 'serviceNames', data: serviceNamesData }
    ];
    let completed = 0;
    saves.forEach(save => {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ type: save.type, [save.type]: save.data }),
            headers: { 'Content-Type': 'application/json' }
        }).finally(() => {
            completed++;
            if (completed === saves.length) {
                saveToLocal();
                showLoading(false);
                showToast('✅ Данные сохранены в облако!');
            }
        });
    });
}

function editServiceName(serviceKey, element) {
    if (!isEditMode) return;
    const currentName = serviceNamesData[serviceKey] || defaultServiceNames[serviceKey];
    const input = document.createElement('input');
    input.value = currentName;
    input.style.cssText = 'padding:8px; border-radius:20px; border:2px solid #ffd966; background:#fff; font-size:14px; width:60%;';
    const parent = element.parentNode;
    element.style.display = 'none';
    parent.appendChild(input);
    input.focus();
    function save() {
        const newName = input.value.trim();
        if (newName) {
            serviceNamesData[serviceKey] = newName;
            element.innerText = newName;
            saveToCloud();
        }
        element.style.display = 'block';
        input.remove();
        refreshAll();
    }
    input.addEventListener('blur', save);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') save(); });
}

function editServiceElement(element, serviceKey, dayKey) {
    if (!isEditMode) return;
    const currentValue = element.innerText;
    const input = document.createElement('input');
    input.value = (currentValue === 'занято') ? '' : currentValue;
    input.placeholder = 'Введите имя (оставьте пустым для "занято")';
    input.style.cssText = 'width:100%; padding:6px; border-radius:12px; border:2px solid #ffd966; background:#fff; color:#000; font-size:13px; text-align:center;';
    const parent = element.parentNode;
    element.style.display = 'none';
    parent.appendChild(input);
    input.focus();
    function saveNewValue() {
        let newValue = input.value.trim();
        if (newValue === '') newValue = 'занято';
        element.innerText = newValue;
        element.style.display = 'block';
        input.remove();
        if (newValue === 'занято') {
            element.classList.add('свободно');
        } else {
            element.classList.remove('свободно');
        }
        if (!servicesData[serviceKey]) servicesData[serviceKey] = {};
        servicesData[serviceKey][dayKey] = newValue;
        saveToCloud();
        showToast(`✅ ${serviceNamesData[serviceKey] || serviceKey}: ${dayKey} → ${newValue}`);
    }
    input.addEventListener('blur', saveNewValue);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveNewValue(); });
}

function showServiceDescription(serviceKey) {
    const displayName = serviceNamesData[serviceKey] || defaultServiceNames[serviceKey];
    const description = serviceDetails[serviceKey] || "Подробное описание служения временно недоступно.";
    const modal = document.getElementById('dayModal');
    document.getElementById('modalTitle').innerHTML = `📖 ${displayName}`;
    document.getElementById('modalDescription').innerHTML = description;
    modal.style.display = 'flex';
}

function generateServicesHTML() {
    const servicesList = ["Ведущий", "Чайханщик", "Уборщик", "Закупщик", "Спикерхантер", "ПБУ", "ПГО", "ПСО", "Литком", "КАЗНАЧЕй", "ПРЕДСЕДАТЕЛь", "замПГО", "РС"];
    const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
    const tripleService = ["Ведущий", "Чайханщик", "Уборщик"];
    const lateEveningDays = ["ВТ", ];
    
    let html = '';
    servicesList.forEach(serviceKey => {
        const displayName = serviceNamesData[serviceKey] || defaultServiceNames[serviceKey];
        const hasMultiTime = tripleService.includes(serviceKey);
        html += `<div class="служащий-карточка" data-service-key="${serviceKey}">
            <div class="имя-служащего">
                <span class="service-name-text">${displayName}</span>
                <button class="edit-name-btn" data-service="${serviceKey}">✏️</button>
            </div>
            <div class="дни-сетка">`;
        
        days.forEach(day => {
            if (hasMultiTime) {
                let times = ["Утро", "Вечер"];
                if (lateEveningDays.includes(day)) times.push("Поздний вечер");
                if (day === "СБ" || day === "ВС") times = times.filter(t => t !== "Утро");
                
                times.forEach(time => {
                    let key = `${day}_${time === 'Утро' ? 'утро' : (time === 'Вечер' ? 'вечер' : 'поздний вечер')}`;
                    let savedValue = 'занято';
                    if (servicesData[serviceKey] && servicesData[serviceKey][key]) savedValue = servicesData[serviceKey][key];
                    const isFree = savedValue === 'занято';
                    html += `<div class="день-ячейка">
                        <span class="название-дня">${day}</span>
                        <span class="подзаголовок">${time}</span>
                        <div class="значение-служения ${isFree ? 'свободно' : ''}" data-service="${serviceKey}" data-day-key="${key}">${savedValue}</div>
                    </div>`;
                });
            } else {
                let savedValue = 'занято';
                if (servicesData[serviceKey] && servicesData[serviceKey][day]) savedValue = servicesData[serviceKey][day];
                const isFree = savedValue === 'занято';
                html += `<div class="день-ячейка">
                    <span class="название-дня">${day}</span>
                    <div class="значение-служения ${isFree ? 'свободно' : ''}" data-service="${serviceKey}" data-day-key="${day}">${savedValue}</div>
                </div>`;
            }
        });
        
        html += `</div><div class="кнопка-подробнее" data-service="${serviceKey}">📖 Подробнее о служении</div></div>`;
    });
    return html;
}

function refreshServices() {
    const container = document.getElementById('scheduleContainer');
    if (container) {
        container.innerHTML = generateServicesHTML();
        document.querySelectorAll('.edit-name-btn').forEach(btn => {
            const serviceKey = btn.getAttribute('data-service');
            const nameSpan = btn.parentElement.querySelector('.service-name-text');
            btn.addEventListener('click', () => editServiceName(serviceKey, nameSpan));
        });
        document.querySelectorAll('.значение-служения').forEach(el => {
            const serviceKey = el.getAttribute('data-service');
            const dayKey = el.getAttribute('data-day-key');
            if (serviceKey && dayKey) {
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);
                newEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editServiceElement(newEl, serviceKey, dayKey);
                });
            }
        });
        document.querySelectorAll('.кнопка-подробнее').forEach(btn => {
            const serviceKey = btn.getAttribute('data-service');
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => showServiceDescription(serviceKey));
        });
    }
}

function showEventEditModal(day, currentText) {
    if (!isEditMode) {
        const modal = document.getElementById('dayModal');
        document.getElementById('modalTitle').innerHTML = day;
        let displayText = currentText.replace(/\n/g, '<br>');
        displayText = displayText.replace(/(https?:\/\/[^\s]+)/g, function(url) {
            return `<a href="${url}" target="_blank" style="color:#ffd966; text-decoration:underline; word-break:break-all;">🔗 Онлайн подключение</a>`;
        });
        document.getElementById('modalDescription').innerHTML = displayText;
        modal.style.display = 'flex';
        return;
    }
    const modal = document.getElementById('dayModal');
    document.getElementById('modalTitle').innerHTML = `✏️ Редактирование: ${day}`;
    const descElem = document.getElementById('modalDescription');
    const textarea = document.createElement('textarea');
    textarea.value = currentText;
    textarea.style.cssText = 'width:100%; height:300px; background:#1e2a3a; color:#fff; border:2px solid #ffd966; border-radius:16px; padding:12px; font-size:14px;';
    const saveBtn = document.createElement('button');
    saveBtn.innerText = '💾 Сохранить изменения';
    saveBtn.style.cssText = 'margin-top:15px; background:#4CAF50; border:none; padding:12px; border-radius:30px; color:white; font-weight:bold; cursor:pointer; width:100%;';
    descElem.innerHTML = '';
    descElem.appendChild(textarea);
    descElem.appendChild(saveBtn);
    modal.style.display = 'flex';
    saveBtn.onclick = () => {
        const newText = textarea.value;
        eventsData[day] = newText;
        saveToCloud();
        descElem.innerHTML = newText.replace(/\n/g, '<br>');
        descElem.appendChild(saveBtn);
        showToast(`✅ Мероприятие на ${day} сохранено`);
        setTimeout(() => modal.style.display = 'none', 1500);
    };
}

function setupDaysHandlers() {
    const dayCards = document.querySelectorAll('.day-card');
    dayCards.forEach(card => {
        const day = card.getAttribute('data-day');
        const eventText = eventsData[day] || defaultEvents[day];
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        newCard.setAttribute('data-day', day);
        newCard.addEventListener('click', () => {
            const text = eventsData[day] || defaultEvents[day];
            showEventEditModal(day, text);
        });
        if (isEditMode) {
            newCard.style.border = '2px solid #ffd966';
            newCard.style.boxShadow = '0 0 10px #ffd966';
        } else {
            newCard.style.border = '2px solid rgba(255,217,102,0.3)';
            newCard.style.boxShadow = 'none';
        }
    });
}

function setEditMode(enabled) {
    isEditMode = enabled;
    const enableBtn = document.getElementById('enableEditBtn');
    const disableBtn = document.getElementById('disableEditBtn');
    const statusDiv = document.getElementById('editModeStatus');
    if (enabled) {
        document.body.classList.add('edit-mode-active');
        if (enableBtn) enableBtn.style.display = 'none';
        if (disableBtn) disableBtn.style.display = 'inline-block';
        if (statusDiv) statusDiv.innerHTML = '✏️ Режим редактирования: ВКЛЮЧЕН';
        showToast('✏️ Режим редактирования ВКЛЮЧЕН!');
    } else {
        document.body.classList.remove('edit-mode-active');
        if (enableBtn) enableBtn.style.display = 'inline-block';
        if (disableBtn) disableBtn.style.display = 'none';
        if (statusDiv) statusDiv.innerHTML = '⚙️ Режим редактирования: ВЫКЛ';
        showToast('🔒 Режим редактирования ВЫКЛЮЧЕН');
    }
    refreshServices();
    setupDaysHandlers();
}

function refreshAll() {
    refreshServices();
    setupDaysHandlers();
}

function resetAllData() {
    if (confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ изменения из облака и локально. Продолжить?')) {
        servicesData = {};
        eventsData = {};
        serviceNamesData = {};
        saveToCloud();
        saveToLocal();
        showToast('🔄 Все данные сброшены! Обновите страницу');
        setTimeout(() => location.reload(), 1500);
    }
}

function setupPasswordSystem() {
    const lockBtn = document.getElementById('lockBtn');
    const modal = document.getElementById('passwordModal');
    const submitBtn = document.getElementById('submitPassword');
    const closeBtn = document.getElementById('closePasswordModal');
    const passwordInput = document.getElementById('passwordInput');
    const errorDiv = document.getElementById('passwordError');
    const adminPanel = document.getElementById('adminPanel');
    
    function openModal() { modal.classList.add('active'); passwordInput.value = ''; errorDiv.innerHTML = ''; passwordInput.focus(); }
    function closeModal() { modal.classList.remove('active'); }
    function checkPassword() {
        if (passwordInput.value === LOCK_PASSWORD) {
            closeModal();
            adminPanel.classList.add('visible');
            showToast('🔓 Добро пожаловать!');
        } else {
            errorDiv.innerHTML = '❌ Неверный пароль!';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
    if (lockBtn) lockBtn.onclick = openModal;
    if (submitBtn) submitBtn.onclick = checkPassword;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (passwordInput) passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPassword(); });
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    
    document.getElementById('enableEditBtn').onclick = () => setEditMode(true);
    document.getElementById('disableEditBtn').onclick = () => setEditMode(false);
    document.getElementById('saveDataBtn').onclick = () => saveToCloud();
    document.getElementById('resetDataBtn').onclick = () => resetAllData();
}

function setupGallery() {
    const images = document.querySelectorAll('.gallery-img');
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('galleryImage');
    const closeBtn = document.getElementById('closeGalleryBtn');
    images.forEach(img => { img.addEventListener('click', () => { modalImg.src = img.src; modal.classList.add('active'); }); });
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    if (modal) modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
}

function setupToggle() {
    const toggleBtn = document.getElementById('toggleServicesBtn');
    const content = document.getElementById('servicesContent');
    if (toggleBtn && content) {
        toggleBtn.onclick = () => {
            content.classList.toggle('show');
            toggleBtn.textContent = content.classList.contains('show') ? '📋 Скрыть служения ' : '📋 Доступные вакантные служения';
        };
    }
    const dailyBtn = document.getElementById('toggleDailyBtn');
    const dailyCont = document.getElementById('dailyContent');
    if (dailyBtn && dailyCont) {
        dailyBtn.onclick = () => {
            dailyCont.classList.toggle('show');
            dailyBtn.textContent = dailyCont.classList.contains('show') ? '📖 Скрыть ежедневник' : '📖 Ежедневник';
            if (dailyCont.classList.contains('show')) renderDaily();
        };
    }
}

function setupDayModalClose() {
    const closeBtn = document.getElementById('closeDayModal');
    const modal = document.getElementById('dayModal');
    if (closeBtn && modal) {
        closeBtn.onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupGoogleSender();
    setupGallery();
    setupToggle();
    setupDayModalClose();
    setupPasswordSystem();
    loadFromCloud();
    renderDaily(); // предварительно рендерим, но контент скрыт до клика
});