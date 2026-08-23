document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const datesList = document.getElementById('dates-list');
    const totalDaysSpan = document.getElementById('total-days');
    const totalHoursSpan = document.getElementById('total-hours');
    const shareBtn = document.getElementById('share-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Quick Fill DOM Elements
    const quickStartContainer = document.getElementById('quick-start-picker-container');
    const quickEndContainer = document.getElementById('quick-end-picker-container');
    const applyQuickFillBtn = document.getElementById('apply-quick-fill');
    const clearAllTimesBtn = document.getElementById('clear-all-times');
    
    // Accordion DOM Elements
    const toggleRules = document.getElementById('toggle-rules');
    const rulesInfo = document.querySelector('.rules-info');

    // App State
    let shiftsData = JSON.parse(localStorage.getItem('julia_calc_shifts')) || {};
    let activeTheme = localStorage.getItem('julia_calc_theme') || 'light-theme';
    let breaksEnabled = shiftsData.breaksEnabled !== false;

    // Time Dropdown Arrays
    const hoursArray = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutesArray = ['00', '15', '30', '45'];
    const periodsArray = ['AM', 'PM'];

    // Apply Theme
    document.body.className = activeTheme;
    updateThemeIcon();

    // Toggle Rules Accordion
    toggleRules.addEventListener('click', () => {
        rulesInfo.classList.toggle('expanded');
    });

    // Toggle Theme
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            activeTheme = 'light-theme';
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            activeTheme = 'dark-theme';
        }
        localStorage.setItem('julia_calc_theme', activeTheme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = themeToggleBtn.querySelector('i');
        if (activeTheme === 'dark-theme') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    // Centering calendar logic (Initialize dates)
    const today = new Date();
    let startDate = formatDateString(today);
    
    // Default range is 7 days (today to today + 6 days)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 6);
    let endDate = formatDateString(endOfWeek);

    // Initialize Custom Date Pickers
    initCustomDatePicker('start-datepicker', startDate, (newDate) => {
        startDate = newDate;
        handleDateRangeChange();
    }, false);

    initCustomDatePicker('end-datepicker', endDate, (newDate) => {
        endDate = newDate;
        handleDateRangeChange();
    }, true);

    // Auto-break checkbox listener
    const enableBreaksCheckbox = document.getElementById('enable-breaks-checkbox');
    if (enableBreaksCheckbox) {
        enableBreaksCheckbox.checked = breaksEnabled;
        enableBreaksCheckbox.addEventListener('change', () => {
            breaksEnabled = enableBreaksCheckbox.checked;
            shiftsData.breaksEnabled = breaksEnabled;
            saveShiftsToLocalStorage();
            
            // Recalculate all row hours
            const rows = datesList.querySelectorAll('.date-row');
            rows.forEach(row => {
                const dateKey = row.dataset.date;
                calculateRowHours(row, dateKey);
            });
            calculateTotalHours();
            showToast(breaksEnabled ? 'Auto-breaks enabled!' : 'Auto-breaks disabled!', 'fa-solid fa-circle-info');
        });
    }

    // Initialize Quick Fill Custom Dropdowns
    if (quickStartContainer && quickEndContainer) {
        quickStartContainer.innerHTML = `
            ${renderCustomDropdownHTML('quick-start-hour', 'Hour', hoursArray, '9')}
            ${renderCustomDropdownHTML('quick-start-minute', 'Min', minutesArray, '00')}
            ${renderCustomDropdownHTML('quick-start-period', 'AM/PM', periodsArray, 'AM')}
        `;

        quickEndContainer.innerHTML = `
            ${renderCustomDropdownHTML('quick-end-hour', 'Hour', hoursArray, '5')}
            ${renderCustomDropdownHTML('quick-end-minute', 'Min', minutesArray, '00')}
            ${renderCustomDropdownHTML('quick-end-period', 'AM/PM', periodsArray, 'PM')}
        `;

        // Bind events to Quick Fill dropdown elements
        initCustomDropdown(quickStartContainer.querySelector('.quick-start-hour'));
        initCustomDropdown(quickStartContainer.querySelector('.quick-start-minute'));
        initCustomDropdown(quickStartContainer.querySelector('.quick-start-period'));
        initCustomDropdown(quickEndContainer.querySelector('.quick-end-hour'));
        initCustomDropdown(quickEndContainer.querySelector('.quick-end-minute'));
        initCustomDropdown(quickEndContainer.querySelector('.quick-end-period'));
    }

    // Close open dropdowns and datepicker calendars when clicking anywhere outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-options-list').forEach(list => {
            list.classList.add('hidden');
            list.parentElement.classList.remove('open');
        });
        document.querySelectorAll('.date-row').forEach(row => {
            row.classList.remove('has-open-dropdown');
        });
        document.querySelectorAll('.datepicker-calendar').forEach(cal => {
            cal.classList.add('hidden');
            cal.parentElement.classList.remove('open');
        });
    });

    // Initial render of days
    renderDaysTable();

    // Quick Fill Action
    applyQuickFillBtn.addEventListener('click', () => {
        const sh = quickStartContainer.querySelector('.quick-start-hour').dataset.value;
        const sm = quickStartContainer.querySelector('.quick-start-minute').dataset.value;
        const sp = quickStartContainer.querySelector('.quick-start-period').dataset.value;
        const eh = quickEndContainer.querySelector('.quick-end-hour').dataset.value;
        const em = quickEndContainer.querySelector('.quick-end-minute').dataset.value;
        const ep = quickEndContainer.querySelector('.quick-end-period').dataset.value;

        if (!sh || !eh) {
            showToast('Please select hours for quick fill!', 'fa-solid fa-circle-exclamation');
            return;
        }

        const rows = datesList.querySelectorAll('.date-row');
        rows.forEach(row => {
            const checkbox = row.querySelector('.row-checkbox');
            if (checkbox && checkbox.checked) {
                const dateKey = row.dataset.date;
                
                setCustomDropdownValue(row.querySelector('.start-hour'), sh);
                setCustomDropdownValue(row.querySelector('.start-minute'), sm);
                setCustomDropdownValue(row.querySelector('.start-period'), sp);
                setCustomDropdownValue(row.querySelector('.end-hour'), eh);
                setCustomDropdownValue(row.querySelector('.end-minute'), em);
                setCustomDropdownValue(row.querySelector('.end-period'), ep);

                // Save to state
                if (!shiftsData[dateKey]) shiftsData[dateKey] = { selected: true };
                shiftsData[dateKey].startHour = sh;
                shiftsData[dateKey].startMinute = sm;
                shiftsData[dateKey].startPeriod = sp;
                shiftsData[dateKey].endHour = eh;
                shiftsData[dateKey].endMinute = em;
                shiftsData[dateKey].endPeriod = ep;
                
                calculateRowHours(row, dateKey);
            }
        });

        saveShiftsToLocalStorage();
        calculateTotalHours();
        showToast('Applied quick-fill to selected days!', 'fa-solid fa-bolt');
    });

    // Clear All Times Action
    clearAllTimesBtn.addEventListener('click', () => {
        const rows = datesList.querySelectorAll('.date-row');
        rows.forEach(row => {
            const dateKey = row.dataset.date;
            
            setCustomDropdownValue(row.querySelector('.start-hour'), '');
            setCustomDropdownValue(row.querySelector('.start-minute'), '00');
            setCustomDropdownValue(row.querySelector('.start-period'), 'AM');
            setCustomDropdownValue(row.querySelector('.end-hour'), '');
            setCustomDropdownValue(row.querySelector('.end-minute'), '00');
            setCustomDropdownValue(row.querySelector('.end-period'), 'PM');
            
            if (shiftsData[dateKey]) {
                shiftsData[dateKey].startHour = '';
                shiftsData[dateKey].startMinute = '00';
                shiftsData[dateKey].startPeriod = 'AM';
                shiftsData[dateKey].endHour = '';
                shiftsData[dateKey].endMinute = '00';
                shiftsData[dateKey].endPeriod = 'PM';
            }

            calculateRowHours(row, dateKey);
        });

        saveShiftsToLocalStorage();
        calculateTotalHours();
        showToast('Cleared all time inputs!', 'fa-solid fa-trash-can');
    });

    // Share Button action
    shareBtn.addEventListener('click', () => {
        const startVal = convertDateToDMY(startDate);
        const endVal = convertDateToDMY(endDate);
        
        let shareText = `Work Period: ${startVal} - ${endVal}\n\nWork Times:\n`;
        let htmlText = `<p><strong>Work Period:</strong> ${startVal} - ${endVal}</p><p><strong>Work Times:</strong><br>`;
        let addedAny = false;

        const rows = datesList.querySelectorAll('.date-row');
        rows.forEach(row => {
            const checkbox = row.querySelector('.row-checkbox');
            if (checkbox && checkbox.checked) {
                const dayText = row.querySelector('.day-text').textContent;
                const dateKey = row.dataset.date;
                const dmyDate = convertDateToDMY(dateKey);
                const sh = row.querySelector('.start-hour').dataset.value;
                const sm = row.querySelector('.start-minute').dataset.value;
                const sp = row.querySelector('.start-period').dataset.value;
                const eh = row.querySelector('.end-hour').dataset.value;
                const em = row.querySelector('.end-minute').dataset.value;
                const ep = row.querySelector('.end-period').dataset.value;

                if (sh && eh) {
                    shareText += `${dayText} ${dmyDate}   ${sh}:${sm}${sp}-${eh}:${em}${ep}\n`;
                    htmlText += `${dayText} ${dmyDate}&nbsp;&nbsp;&nbsp;${sh}:${sm}${sp}-${eh}:${em}${ep}<br>`;
                    addedAny = true;
                } else {
                    shareText += `${dayText} ${dmyDate}   Did not work / No times entered\n`;
                    htmlText += `${dayText} ${dmyDate}&nbsp;&nbsp;&nbsp;Did not work / No times entered<br>`;
                }
            }
        });

        if (!addedAny && rows.length > 0) {
            shareText += `No times entered for this period.\n`;
            htmlText += `No times entered for this period.<br>`;
        }

        const totalHours = totalHoursSpan.textContent.replace(' hrs', '');
        shareText += `\nTotal Hours: ${totalHours} hrs`;
        htmlText += `</p><p><strong>Total Hours:</strong> ${totalHours} hrs</p>`;

        try {
            const textBlob = new Blob([shareText], { type: 'text/plain' });
            const htmlBlob = new Blob([htmlText], { type: 'text/html' });
            const item = new ClipboardItem({
                'text/plain': textBlob,
                'text/html': htmlBlob
            });
            navigator.clipboard.write([item]).then(() => {
                showToast('Work sheet copied with bold titles!', 'fa-solid fa-circle-check');
            }).catch(err => {
                // Fallback for systems that block ClipboardItem HTML blobs
                navigator.clipboard.writeText(shareText).then(() => {
                    showToast('Work sheet copied (plain text)!', 'fa-solid fa-circle-check');
                });
            });
        } catch (e) {
            // Standard fallback
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('Work sheet copied!', 'fa-solid fa-circle-check');
            });
        }
    });

    function convertDateToDMY(dateKey) {
        const parts = dateKey.split('-');
        if (parts.length !== 3) return dateKey;
        const yyyy = parts[0];
        const mm = parts[1];
        const dd = parts[2];
        const yy = yyyy.slice(-2);
        return `${dd}/${mm}/${yy}`;
    }

    // Helper functions
    function formatDateString(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function handleDateRangeChange() {
        if (!startDate || !endDate) {
            renderDaysTable();
            return;
        }

        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');

        if (start > end) {
            // Keep end date locked to start date if it precedes start date
            endDate = startDate;
            const endPicker = document.getElementById('end-datepicker');
            if (endPicker && endPicker.setDateVal) {
                endPicker.setDateVal(endDate);
            }
        }

        renderDaysTable();
    }

    function renderDaysTable() {
        const startStr = startDate;
        const endStr = endDate;

        if (!startStr || !endStr) return;

        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');

        datesList.innerHTML = '';
        
        let current = new Date(start);
        let renderedCount = 0;

        while (current <= end) {
            const dateKey = formatDateString(current);
            const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
            const dateLabel = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Initialize defaults in shiftsData state if empty
            if (!shiftsData[dateKey]) {
                shiftsData[dateKey] = {
                    selected: true,
                    startHour: '',
                    startMinute: '00',
                    startPeriod: 'AM',
                    endHour: '',
                    endMinute: '00',
                    endPeriod: 'PM',
                    hoursWorked: 0
                };
            }

            const state = shiftsData[dateKey];
            const isChecked = state.selected !== false; // default true

            const row = document.createElement('div');
            row.className = `date-row ${isChecked ? '' : 'unselected'}`;
            row.dataset.date = dateKey;

            row.innerHTML = `
                <div class="col-check">
                    <label class="checkbox-container">
                        <input type="checkbox" class="row-checkbox" ${isChecked ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="col-day">
                    <span class="day-text">${dayName}</span>
                </div>
                <div class="col-date">
                    <span class="date-text">${dateLabel}</span>
                </div>
                
                <!-- Desktop Start Column & Mobile Start Wrapper -->
                <div class="col-time-start">
                    <span class="mobile-label">Start</span>
                    <div class="picker-inline">
                        ${renderCustomDropdownHTML('start-hour', 'Hour', hoursArray, state.startHour)}
                        ${renderCustomDropdownHTML('start-minute', 'Min', minutesArray, state.startMinute)}
                        ${renderCustomDropdownHTML('start-period', 'AM/PM', periodsArray, state.startPeriod)}
                    </div>
                </div>
                
                <!-- Desktop End Column & Mobile End Wrapper -->
                <div class="col-time-end">
                    <span class="mobile-label">End</span>
                    <div class="picker-inline">
                        ${renderCustomDropdownHTML('end-hour', 'Hour', hoursArray, state.endHour)}
                        ${renderCustomDropdownHTML('end-minute', 'Min', minutesArray, state.endMinute)}
                        ${renderCustomDropdownHTML('end-period', 'AM/PM', periodsArray, state.endPeriod)}
                    </div>
                </div>
                
                <div class="col-hours col-hours-val">-</div>
            `;

            // Row Select Change Listener
            const checkbox = row.querySelector('.row-checkbox');
            checkbox.addEventListener('change', (e) => {
                const checked = e.target.checked;
                shiftsData[dateKey].selected = checked;
                
                if (checked) {
                    row.classList.remove('unselected');
                } else {
                    row.classList.add('unselected');
                }
                
                saveShiftsToLocalStorage();
                calculateTotalHours();
            });

            // Initialize custom dropdown events
            initCustomDropdown(row.querySelector('.start-hour'), (val) => {
                shiftsData[dateKey].startHour = val;
                handleRowTimeChange(row, dateKey);
            });
            initCustomDropdown(row.querySelector('.start-minute'), (val) => {
                shiftsData[dateKey].startMinute = val;
                handleRowTimeChange(row, dateKey);
            });
            initCustomDropdown(row.querySelector('.start-period'), (val) => {
                shiftsData[dateKey].startPeriod = val;
                handleRowTimeChange(row, dateKey);
            });
            initCustomDropdown(row.querySelector('.end-hour'), (val) => {
                shiftsData[dateKey].endHour = val;
                handleRowTimeChange(row, dateKey);
            });
            initCustomDropdown(row.querySelector('.end-minute'), (val) => {
                shiftsData[dateKey].endMinute = val;
                handleRowTimeChange(row, dateKey);
            });
            initCustomDropdown(row.querySelector('.end-period'), (val) => {
                shiftsData[dateKey].endPeriod = val;
                handleRowTimeChange(row, dateKey);
            });

            datesList.appendChild(row);
            
            // Perform initial calculations for this row
            calculateRowHours(row, dateKey);

            renderedCount++;
            current.setDate(current.getDate() + 1);
        }

        calculateTotalHours();
    }

    function handleRowTimeChange(row, dateKey) {
        calculateRowHours(row, dateKey);
        saveShiftsToLocalStorage();
        calculateTotalHours();
    }

    // HTML Generator for Custom Dropdowns
    function renderCustomDropdownHTML(className, placeholder, optionsArray, selectedVal) {
        let optionsHTML = `<div class="dropdown-option ${selectedVal === '' ? 'active' : ''}" data-value="">${placeholder}</div>`;
        optionsHTML += optionsArray.map(opt => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const isActive = String(val) === String(selectedVal);
            return `<div class="dropdown-option ${isActive ? 'active' : ''}" data-value="${val}">${label}</div>`;
        }).join('');

        const displayLabelOpt = optionsArray.find(opt => {
            const val = typeof opt === 'object' ? opt.value : opt;
            return String(val) === String(selectedVal);
        });
        const labelText = displayLabelOpt ? (typeof displayLabelOpt === 'object' ? displayLabelOpt.label : displayLabelOpt) : placeholder;

        return `
            <div class="custom-dropdown ${className}" data-value="${selectedVal}">
                <div class="dropdown-trigger">
                    <span class="trigger-label">${labelText}</span>
                    <i class="fa-solid fa-chevron-down caret-icon"></i>
                </div>
                <div class="dropdown-options-list hidden">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }

    // Initialize events on a custom dropdown
    function initCustomDropdown(container, onChange) {
        const trigger = container.querySelector('.dropdown-trigger');
        const optionsList = container.querySelector('.dropdown-options-list');
        const options = container.querySelectorAll('.dropdown-option');
        const label = container.querySelector('.trigger-label');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close all other open dropdowns
            document.querySelectorAll('.dropdown-options-list').forEach(list => {
                if (list !== optionsList) {
                    list.classList.add('hidden');
                    list.parentElement.classList.remove('open');
                    const parentRow = list.closest('.date-row');
                    if (parentRow) parentRow.classList.remove('has-open-dropdown');
                }
            });
            
            const isOpen = !optionsList.classList.contains('hidden');
            const currentRow = container.closest('.date-row');
            if (isOpen) {
                optionsList.classList.add('hidden');
                container.classList.remove('open');
                if (currentRow) currentRow.classList.remove('has-open-dropdown');
            } else {
                optionsList.classList.remove('hidden');
                container.classList.add('open');
                if (currentRow) currentRow.classList.add('has-open-dropdown');

                // Ensure bottom of dropdown is completely visible above sticky bottom summary
                setTimeout(() => {
                    const rect = optionsList.getBoundingClientRect();
                    const footer = document.querySelector('.app-summary');
                    const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
                    if (rect.bottom > footerTop - 16) {
                        const scrollNeeded = rect.bottom - (footerTop - 16);
                        window.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
                    }
                }, 50);
            }
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent;
                
                container.dataset.value = value;
                label.textContent = text;
                optionsList.classList.add('hidden');
                container.classList.remove('open');
                const currentRow = container.closest('.date-row');
                if (currentRow) currentRow.classList.remove('has-open-dropdown');
                
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                if (onChange) onChange(value);
            });
        });
    }

    // Programmatically set custom dropdown values
    function setCustomDropdownValue(container, value) {
        container.dataset.value = value;
        const options = container.querySelectorAll('.dropdown-option');
        const label = container.querySelector('.trigger-label');
        
        options.forEach(opt => opt.classList.remove('active'));
        
        const matchedOption = container.querySelector(`.dropdown-option[data-value="${value}"]`);
        if (matchedOption) {
            label.textContent = matchedOption.textContent;
            matchedOption.classList.add('active');
        } else {
            label.textContent = container.classList.contains('start-hour') || container.classList.contains('end-hour') || container.classList.contains('quick-start-hour') || container.classList.contains('quick-end-hour') ? 'Hour' : '--';
        }
    }

    // Row-level duration calculations
    function calculateRowHours(row, dateKey) {
        const hoursEl = row.querySelector('.col-hours-val');
        const sh = row.querySelector('.start-hour').dataset.value;
        const sm = row.querySelector('.start-minute').dataset.value;
        const sp = row.querySelector('.start-period').dataset.value;
        const eh = row.querySelector('.end-hour').dataset.value;
        const em = row.querySelector('.end-minute').dataset.value;
        const ep = row.querySelector('.end-period').dataset.value;

        if (!sh || !eh) {
            hoursEl.textContent = '-';
            hoursEl.removeAttribute('title');
            if (shiftsData[dateKey]) shiftsData[dateKey].hoursWorked = 0;
            return;
        }

        // Calculate hours
        let startDecimal = convertTimeToDecimal(sh, sm, sp);
        let endDecimal = convertTimeToDecimal(eh, em, ep);

        let N = endDecimal - startDecimal;
        if (N < 0) {
            // Over midnight
            N += 24;
        }

        // Apply deduction break logic
        // Formula: if N > 5, deduct 1.0h (60 min); if N <= 5, deduct 0h (0 min)
        let deduction = 0;
        let tooltip = '';
        
        if (breaksEnabled && N > 0) {
            if (N > 5) {
                deduction = 1.0;
                tooltip = `Break deduction: 1 hour (Worked > 5 hours)`;
            } else {
                deduction = 0;
                tooltip = `Break deduction: 0 hours (Worked \u2264 5 hours)`;
            }
        }

        const calculated = N - deduction;
        const finalHours = Math.max(0, calculated);
        
        if (shiftsData[dateKey]) shiftsData[dateKey].hoursWorked = finalHours;

        hoursEl.textContent = `${finalHours.toFixed(2)} hrs`;
        if (tooltip) {
            hoursEl.setAttribute('title', tooltip);
            hoursEl.style.cursor = 'help';
        } else {
            hoursEl.removeAttribute('title');
            hoursEl.style.cursor = 'default';
        }
    }

    function convertTimeToDecimal(hour, minute, period) {
        let hr = parseInt(hour);
        const min = parseInt(minute);
        
        if (period === 'PM' && hr !== 12) {
            hr += 12;
        } else if (period === 'AM' && hr === 12) {
            hr = 0;
        }
        
        return hr + (min / 60);
    }

    // Aggregating Totals
    function calculateTotalHours() {
        let totalHours = 0;
        let selectedDaysCount = 0;

        const rows = datesList.querySelectorAll('.date-row');
        rows.forEach(row => {
            const dateKey = row.dataset.date;
            const checkbox = row.querySelector('.row-checkbox');

            if (checkbox && checkbox.checked) {
                selectedDaysCount++;
                const hoursVal = shiftsData[dateKey] ? shiftsData[dateKey].hoursWorked : 0;
                totalHours += parseFloat(hoursVal || 0);
            }
        });

        totalDaysSpan.textContent = selectedDaysCount;
        totalHoursSpan.innerHTML = `${totalHours.toFixed(2)} <span class="unit">hrs</span>`;
    }

    function saveShiftsToLocalStorage() {
        localStorage.setItem('julia_calc_shifts', JSON.stringify(shiftsData));
    }

    function formatDateToDMYLong(dateStr) {
        if (!dateStr) return '--/--/----';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function initCustomDatePicker(containerId, initialDateStr, onChange, isEndDate) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const trigger = container.querySelector('.datepicker-trigger');
        const valueSpan = container.querySelector('.datepicker-value');
        const calendar = container.querySelector('.datepicker-calendar');
        
        let selectedDate = initialDateStr ? new Date(initialDateStr + 'T00:00:00') : null;
        let viewDate = selectedDate ? new Date(selectedDate) : new Date();

        function updateTrigger() {
            if (selectedDate) {
                valueSpan.textContent = formatDateToDMYLong(formatDateString(selectedDate));
            } else {
                valueSpan.textContent = '--/--/----';
            }
        }
        updateTrigger();

        function renderCalendar() {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            
            let html = `
                <div class="calendar-header">
                    <span class="month-year-label">${monthNames[month]} ${year}</span>
                    <div class="calendar-nav" style="display: flex; gap: 4px;">
                        <button class="cal-btn prev-month" type="button"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="cal-btn next-month" type="button"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
                <div class="calendar-weekdays">
                    <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
                </div>
                <div class="calendar-days">
            `;
            
            const firstDay = new Date(year, month, 1);
            const startDay = firstDay.getDay(); // 0 is Sun, 1 is Mon...
            const paddingCount = (startDay === 0) ? 6 : startDay - 1;
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            // Render prev month padding days
            for (let i = paddingCount - 1; i >= 0; i--) {
                const dayNum = daysInPrevMonth - i;
                html += `<div class="day-num padding-day">${dayNum}</div>`;
            }
            
            const todayStr = formatDateString(new Date());
            const selectedStr = selectedDate ? formatDateString(selectedDate) : '';
            
            for (let d = 1; d <= daysInMonth; d++) {
                const dateObj = new Date(year, month, d);
                const dateStr = formatDateString(dateObj);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedStr;
                
                let classes = 'day-num active-day';
                if (isToday) classes += ' today';
                if (isSelected) classes += ' selected';
                
                // For End Date picker: highlight selected range and start date outline
                if (isEndDate) {
                    if (dateStr === startDate) {
                        classes += ' range-start';
                    } else if (startDate && dateStr > startDate && selectedStr && dateStr < selectedStr) {
                        classes += ' in-range';
                    }
                }
                
                html += `<div class="day-num ${classes}" data-date="${dateStr}">${d}</div>`;
            }
            
            const totalCells = paddingCount + daysInMonth;
            const nextDaysCount = 42 - totalCells;
            for (let i = 1; i <= nextDaysCount; i++) {
                html += `<div class="day-num padding-day">${i}</div>`;
            }
            
            html += `
                </div>
                <div class="calendar-footer">
                    <button class="cal-footer-btn clear-btn" type="button">Clear</button>
                    <button class="cal-footer-btn today-btn" type="button">Today</button>
                </div>
            `;
            
            calendar.innerHTML = html;
            
            // Stop click propagation inside calendar
            calendar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Listeners for active days
            const dayCells = calendar.querySelectorAll('.active-day');
            dayCells.forEach(dayEl => {
                dayEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dateStr = dayEl.dataset.date;
                    selectedDate = new Date(dateStr + 'T00:00:00');
                    updateTrigger();
                    calendar.classList.add('hidden');
                    container.classList.remove('open');
                    onChange(dateStr);
                });
                
                // Add interactive range highlight for End Date calendar on hover
                if (isEndDate && startDate) {
                    dayEl.addEventListener('mouseenter', () => {
                        const hoverDateStr = dayEl.dataset.date;
                        if (hoverDateStr >= startDate) {
                            // Find all day elements and apply in-range-hover class
                            dayCells.forEach(cell => {
                                const cellDateStr = cell.dataset.date;
                                if (cellDateStr > startDate && cellDateStr <= hoverDateStr) {
                                    cell.classList.add('in-range-hover');
                                } else {
                                    cell.classList.remove('in-range-hover');
                                }
                            });
                        }
                    });
                }
            });

            // Touch dragging support for mobile
            if (isEndDate && startDate) {
                const daysGrid = calendar.querySelector('.calendar-days');
                
                const handleTouchHighlight = (e) => {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.classList.contains('active-day') && element.closest('#end-datepicker')) {
                        const hoverDateStr = element.dataset.date;
                        if (hoverDateStr >= startDate) {
                            dayCells.forEach(cell => {
                                const cellDateStr = cell.dataset.date;
                                if (cellDateStr > startDate && cellDateStr <= hoverDateStr) {
                                    cell.classList.add('in-range-hover');
                                } else {
                                    cell.classList.remove('in-range-hover');
                                }
                            });
                        }
                    }
                };

                daysGrid.addEventListener('touchmove', handleTouchHighlight, { passive: true });
                daysGrid.addEventListener('touchend', () => {
                    dayCells.forEach(cell => cell.classList.remove('in-range-hover'));
                });
            }

            // If we are in the End Date picker, clear hover highlights when leaving the days grid
            if (isEndDate) {
                const daysGrid = calendar.querySelector('.calendar-days');
                daysGrid.addEventListener('mouseleave', () => {
                    dayCells.forEach(cell => cell.classList.remove('in-range-hover'));
                });
            }
            
            // Prev button click
            calendar.querySelector('.prev-month').addEventListener('click', (e) => {
                e.stopPropagation();
                viewDate.setMonth(viewDate.getMonth() - 1);
                renderCalendar();
            });
            
            // Next button click
            calendar.querySelector('.next-month').addEventListener('click', (e) => {
                e.stopPropagation();
                viewDate.setMonth(viewDate.getMonth() + 1);
                renderCalendar();
            });
            
            // Clear click
            calendar.querySelector('.clear-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                selectedDate = null;
                updateTrigger();
                calendar.classList.add('hidden');
                container.classList.remove('open');
                onChange('');
            });
            
            // Today click
            calendar.querySelector('.today-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const todayObj = new Date();
                selectedDate = todayObj;
                viewDate = new Date(todayObj);
                updateTrigger();
                calendar.classList.add('hidden');
                container.classList.remove('open');
                onChange(formatDateString(todayObj));
            });
        }
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other custom datepicker calendars and time dropdowns
            document.querySelectorAll('.datepicker-calendar').forEach(cal => {
                if (cal !== calendar) {
                    cal.classList.add('hidden');
                    cal.parentElement.classList.remove('open');
                }
            });
            document.querySelectorAll('.dropdown-options-list').forEach(list => {
                list.classList.add('hidden');
                list.parentElement.classList.remove('open');
            });
            
            const isOpen = !calendar.classList.contains('hidden');
            if (isOpen) {
                calendar.classList.add('hidden');
                container.classList.remove('open');
            } else {
                viewDate = selectedDate ? new Date(selectedDate) : new Date();
                renderCalendar();
                calendar.classList.remove('hidden');
                container.classList.add('open');
            }
        });

        // Set date programmatically
        container.setDateVal = function(dateStr) {
            selectedDate = dateStr ? new Date(dateStr + 'T00:00:00') : null;
            updateTrigger();
        };
    }

    // Custom Toast Notification System
    let toastTimeout;
    function showToast(message, iconClass = 'fa-solid fa-circle-check') {
        const icon = toast.querySelector('i');
        icon.className = iconClass;
        toastMessage.textContent = message;
        
        toast.classList.remove('hidden');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});