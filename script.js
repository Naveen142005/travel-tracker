// === DataStore Module (MockAPI) ===
const API_URL = 'https://6a718e7ef687776c13f05fa9.mockapi.io/api/v1/trips';

const DataStore = {
    async getTrips() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch trips');
        return await res.json();
    },
    async addTrip(trip) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(trip)
        });
        if (!res.ok) throw new Error('Failed to add trip');
        return await res.json();
    },
    async updateTrip(id, trip) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(trip)
        });
        if (!res.ok) throw new Error('Failed to update trip');
        return await res.json();
    },
    async deleteTrip(id) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete trip');
        return await res.json();
    },
    getLocations() {
        const locs = localStorage.getItem('travelLogLocations');
        if (!locs) {
            const defaultLocs = ['Srivi', 'Trichy'];
            localStorage.setItem('travelLogLocations', JSON.stringify(defaultLocs));
            return defaultLocs;
        }
        return JSON.parse(locs);
    },
    addLocation(loc) {
        if (!loc) return;
        const locs = this.getLocations();
        if (!locs.includes(loc)) {
            locs.push(loc);
            localStorage.setItem('travelLogLocations', JSON.stringify(locs));
            return true;
        }
        return false;
    }
};

// === Icons (SVG) ===
const Icons = {
    bus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><path d="M7 18a2 2 0 1 0-4 0"/><path d="M17 18a2 2 0 1 0-4 0"/></svg>',
    train: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h0"/><path d="M16 15h0"/></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    starFilled: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
};

// === State & DOM ===
let currentTrips = [];
let filteredTrips = [];
let editingId = null;

// Pagination state
let timelineCurrentPage = 1;
let timelineItemsPerPage = 10;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const DOM = {
    // Loader
    globalLoader: document.getElementById('globalLoader'),

    // Nav Drawer
    menuBtn: document.getElementById('menuBtn'),
    navDrawer: document.getElementById('navDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    navBtns: document.querySelectorAll('.nav-btn'),
    
    // Header actions
    themeToggle: document.getElementById('themeToggle'),
    openAddTripBtn: document.getElementById('openAddTripBtn'),
    openFilterBtn: document.getElementById('openFilterBtn'),
    dataBtn: document.getElementById('dataBtn'),
    
    // Modals
    tripModal: document.getElementById('tripModal'),
    closeTripModalBtn: document.getElementById('closeTripModalBtn'),
    filterModal: document.getElementById('filterModal'),
    closeFilterModalBtn: document.getElementById('closeFilterModalBtn'),
    dataModal: document.getElementById('dataModal'),
    closeDataModal: document.getElementById('closeDataModal'),
    calendarDayModal: document.getElementById('calendarDayModal'),
    closeCalendarModalBtn: document.getElementById('closeCalendarModalBtn'),
    calendarDayTitle: document.getElementById('calendarDayTitle'),
    calendarDayTrips: document.getElementById('calendarDayTrips'),

    // Views
    views: document.querySelectorAll('.view-section'),
    
    // Filters
    filterSearch: document.getElementById('filterSearch'),
    filterMonth: document.getElementById('filterMonth'),
    filterYear: document.getElementById('filterYear'),
    filterRoute: document.getElementById('filterRoute'),
    filterMode: document.getElementById('filterMode'),
    filterStatus: document.getElementById('filterStatus'),
    filterFavorite: document.getElementById('filterFavorite'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Add Trip Form
    tripForm: document.getElementById('tripForm'),
    formTitle: document.getElementById('formTitle'),
    tripId: document.getElementById('tripId'),
    tripDate: document.getElementById('tripDate'),
    tripCost: document.getElementById('tripCost'),
    legsContainer: document.getElementById('legsContainer'),
    addLegBtn: document.getElementById('addLegBtn'),
    tripStatus: document.getElementById('tripStatus'),
    tripNotes: document.getElementById('tripNotes'),
    tripFavorite: document.getElementById('tripFavorite'),
    formError: document.getElementById('formError'),
    locationsList: document.getElementById('locationsList'),

    // Dashboard Stats
    statTotalTrips: document.getElementById('statTotalTrips'),
    statTotalSpent: document.getElementById('statTotalSpent'),
    statTopRoute: document.getElementById('statTopRoute'),
    statUniqueRoutes: document.getElementById('statUniqueRoutes'),
    statModeSplit: document.getElementById('statModeSplit'),
    statTripsMonth: document.getElementById('statTripsMonth'),
    statTripsYear: document.getElementById('statTripsYear'),
    statLatestTrip: document.getElementById('statLatestTrip'),
    statNextTrip: document.getElementById('statNextTrip'),

    // Stats View
    statsFilterLabel: document.getElementById('statsFilterLabel'),
    statsOverview: document.getElementById('statsOverview'),
    routeBarChart: document.getElementById('routeBarChart'),

    // Calendar
    calPrevBtn: document.getElementById('calPrevBtn'),
    calNextBtn: document.getElementById('calNextBtn'),
    calendarTitle: document.getElementById('calendarTitle'),
    calendarGrid: document.getElementById('calendarGrid'),

    // Timeline
    timelineContainer: document.getElementById('timelineContainer'),
    timelineEmpty: document.getElementById('timelineEmpty'),
    timelinePagination: document.getElementById('timelinePagination'),
    timelineItemsPerPage: document.getElementById('timelineItemsPerPage'),
    timelinePageControls: document.getElementById('timelinePageControls'),
    
    // Import/Export
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    importFileInput: document.getElementById('importFileInput'),
    restoreBtn: document.getElementById('restoreBtn'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    importStatus: document.getElementById('importStatus')
};

// === Initialization ===
async function init() {
    initTheme();
    DOM.globalLoader.classList.remove('hidden');
    
    await loadData();
    
    setupEventListeners();
    updateLocationsDatalist();
    populateFilterDropdowns();
    applyFilters();
    
    DOM.globalLoader.classList.add('hidden');
}

async function loadData() {
    try {
        currentTrips = await DataStore.getTrips();
        filteredTrips = [...currentTrips];
        DOM.tripDate.value = new Date().toISOString().split('T')[0];
    } catch (err) {
        console.error(err);
        alert("Failed to load data from MockAPI. Please try again.");
    }
}

// === Theme Management ===
function initTheme() {
    const savedTheme = localStorage.getItem('travelLogTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('travelLogTheme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (theme === 'dark') {
        sun.style.display = 'none';
        moon.style.display = 'block';
    } else {
        sun.style.display = 'block';
        moon.style.display = 'none';
    }
}

// === Navigation & Drawer ===
function switchView(viewId) {
    DOM.views.forEach(view => view.classList.remove('active'));
    DOM.navBtns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    
    closeDrawer();
}

function openDrawer() {
    DOM.navDrawer.classList.add('open');
    DOM.drawerBackdrop.classList.add('open');
}

function closeDrawer() {
    DOM.navDrawer.classList.remove('open');
    DOM.drawerBackdrop.classList.remove('open');
}

// === Event Listeners Setup ===
function setupEventListeners() {
    // Dynamic Expense Tracker Links
    const EXPENSE_TRACKER_URL = localStorage.getItem('expenseTrackerUrl') || 'https://expense-tracer-seven.vercel.app/';
    const headerExpenseLink = document.getElementById('headerExpenseLink');
    const drawerExpenseLink = document.getElementById('drawerExpenseLink');
    if (headerExpenseLink) headerExpenseLink.href = EXPENSE_TRACKER_URL;
    if (drawerExpenseLink) drawerExpenseLink.href = EXPENSE_TRACKER_URL;

    // Nav Drawer
    DOM.menuBtn.addEventListener('click', openDrawer);
    DOM.closeDrawerBtn.addEventListener('click', closeDrawer);
    DOM.drawerBackdrop.addEventListener('click', closeDrawer);
    DOM.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => switchView(e.currentTarget.dataset.view));
    });

    // Theme
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // Form Modal
    DOM.openAddTripBtn.addEventListener('click', () => {
        resetForm();
        DOM.tripModal.showModal();
    });
    DOM.closeTripModalBtn.addEventListener('click', () => {
        DOM.tripModal.close();
    });
    DOM.tripModal.addEventListener('click', (e) => {
        if (e.target === DOM.tripModal) DOM.tripModal.close();
    });
    
    DOM.tripForm.addEventListener('submit', handleFormSubmit);
    DOM.addLegBtn.addEventListener('click', addLegRow);

    // Filter Modal
    const openFilter = () => DOM.filterModal.showModal();
    DOM.openFilterBtn.addEventListener('click', openFilter);
    DOM.closeFilterModalBtn.addEventListener('click', () => DOM.filterModal.close());
    DOM.filterModal.addEventListener('click', (e) => {
        if (e.target === DOM.filterModal) DOM.filterModal.close();
    });

    // Calendar Modal
    DOM.closeCalendarModalBtn.addEventListener('click', () => DOM.calendarDayModal.close());
    DOM.calendarDayModal.addEventListener('click', (e) => {
        if (e.target === DOM.calendarDayModal) DOM.calendarDayModal.close();
    });

    // Filters
    const filterInputs = [DOM.filterSearch, DOM.filterMonth, DOM.filterYear, DOM.filterRoute, DOM.filterMode, DOM.filterStatus, DOM.filterFavorite];
    filterInputs.forEach(input => input.addEventListener('input', applyFilters));
    
    DOM.resetFiltersBtn.addEventListener('click', () => {
        filterInputs.forEach(i => {
            if (i.type === 'checkbox') i.checked = false;
            else i.value = '';
        });
        applyFilters();
    });

    // Data Modal
    DOM.dataBtn.addEventListener('click', () => DOM.dataModal.showModal());
    DOM.closeDataModal.addEventListener('click', () => {
        DOM.dataModal.close();
        DOM.importStatus.textContent = '';
        DOM.importStatus.className = 'import-status';
        DOM.restoreBtn.style.display = 'none';
        DOM.importFileInput.value = '';
    });
    DOM.dataModal.addEventListener('click', (e) => {
        if (e.target === DOM.dataModal) DOM.dataModal.close();
    });
    
    // Import / Export
    DOM.exportJsonBtn.addEventListener('click', exportJSON);
    DOM.exportCsvBtn.addEventListener('click', exportCSV);
    DOM.importFileInput.addEventListener('change', handleFileSelect);
    DOM.restoreBtn.addEventListener('click', processImport);
    DOM.clearDataBtn.addEventListener('click', confirmClearData);

    // Calendar navigation
    DOM.calPrevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });
    DOM.calNextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });
}

// === Multi-Leg Form Logic ===
function createLegRow(fromVal = '', toVal = '', modeVal = 'Bus', isFirst = false) {
    const row = document.createElement('div');
    row.className = 'leg-row';
    
    const fromInput = document.createElement('input');
    fromInput.type = 'text';
    fromInput.className = 'leg-from';
    fromInput.setAttribute('list', 'locationsList');
    fromInput.placeholder = 'From';
    fromInput.required = true;
    fromInput.value = fromVal;
    
    const arrow = document.createElement('span');
    arrow.className = 'leg-arrow';
    arrow.innerHTML = '&rarr;';
    
    const toInput = document.createElement('input');
    toInput.type = 'text';
    toInput.className = 'leg-to';
    toInput.setAttribute('list', 'locationsList');
    toInput.placeholder = 'To';
    toInput.required = true;
    toInput.value = toVal;
    
    const modeSelect = document.createElement('select');
    modeSelect.className = 'leg-mode';
    modeSelect.required = true;
    modeSelect.innerHTML = `
        <option value="Bus" ${modeVal === 'Bus' ? 'selected' : ''}>Bus</option>
        <option value="Train" ${modeVal === 'Train' ? 'selected' : ''}>Train</option>
    `;
    
    row.appendChild(fromInput);
    row.appendChild(arrow);
    row.appendChild(toInput);
    row.appendChild(modeSelect);
    
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-btn delete-leg-btn';
    delBtn.innerHTML = Icons.delete;
    delBtn.title = 'Remove Connection';
    
    if (isFirst) {
        delBtn.style.visibility = 'hidden';
    } else {
        delBtn.onclick = () => {
            row.remove();
        };
    }
    row.appendChild(delBtn);
    
    return row;
}

function addLegRow() {
    let prefillFrom = '';
    const existingLegs = DOM.legsContainer.querySelectorAll('.leg-row');
    if (existingLegs.length > 0) {
        const lastTo = existingLegs[existingLegs.length - 1].querySelector('.leg-to').value;
        prefillFrom = lastTo;
    }
    const newRow = createLegRow(prefillFrom, '', 'Bus', false);
    DOM.legsContainer.appendChild(newRow);
    newRow.querySelector('.leg-to').focus();
}

function getLegsData() {
    const legs = [];
    const rows = DOM.legsContainer.querySelectorAll('.leg-row');
    rows.forEach(row => {
        const from = toTitleCase(row.querySelector('.leg-from').value.trim());
        const to = toTitleCase(row.querySelector('.leg-to').value.trim());
        const mode = row.querySelector('.leg-mode').value;
        if (from && to) {
            legs.push({ from, to, mode });
        }
    });
    return legs;
}

// === Logic & Handlers ===
function updateLocationsDatalist() {
    const locs = DataStore.getLocations();
    DOM.locationsList.innerHTML = '';
    locs.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        DOM.locationsList.appendChild(option);
    });
}

function populateFilterDropdowns() {
    // Years
    const years = [...new Set(currentTrips.map(t => t.date.split('-')[0]))].sort((a,b) => b-a);
    DOM.filterYear.innerHTML = '<option value="">All Years</option>';
    years.forEach(y => DOM.filterYear.add(new Option(y, y)));

    // Months (Standard 1-12)
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    DOM.filterMonth.innerHTML = '<option value="">All Months</option>';
    monthNames.forEach((m, i) => DOM.filterMonth.add(new Option(m, (i+1).toString().padStart(2, '0'))));

    // Routes (Overall)
    const routes = [...new Set(currentTrips.map(t => `${t.from} → ${t.to}`))].sort();
    DOM.filterRoute.innerHTML = '<option value="">All Routes</option>';
    routes.forEach(r => DOM.filterRoute.add(new Option(r, r)));
}

function showError(msg) {
    DOM.formError.textContent = msg;
    DOM.formError.style.display = 'block';
    setTimeout(() => DOM.formError.style.display = 'none', 5000);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const date = DOM.tripDate.value;
    const cost = parseFloat(DOM.tripCost.value) || 0;
    const status = DOM.tripStatus.value;
    const notes = DOM.tripNotes.value.trim();
    const favorite = DOM.tripFavorite.checked;

    const legs = getLegsData();
    if (legs.length === 0) {
        showError("Please add at least one route leg.");
        return;
    }

    // Validation
    for (let i=0; i<legs.length; i++) {
        if (legs[i].from.toLowerCase() === legs[i].to.toLowerCase()) {
            showError("A connection's From and To locations cannot be identical.");
            return;
        }
    }
    
    if (status === 'Completed' && new Date(date) > new Date()) {
        showError("Completed trips cannot have a future date.");
        return;
    }

    // Derive overall properties
    const overallFrom = legs[0].from;
    const overallTo = legs[legs.length - 1].to;
    const allModes = [...new Set(legs.map(l => l.mode))];
    const overallMode = allModes.length === 1 ? allModes[0] : 'Mixed';

    // Dedup check against loaded trips
    const isDuplicate = currentTrips.some(t => 
        t.id !== editingId && 
        t.date === date && 
        t.from.toLowerCase() === overallFrom.toLowerCase() && 
        t.to.toLowerCase() === overallTo.toLowerCase() && 
        JSON.stringify(t.legs) === JSON.stringify(legs)
    );
    
    if (isDuplicate) {
        showError("A duplicate trip already exists with these exact connections.");
        return;
    }

    const tripData = {
        date, 
        cost,
        from: overallFrom, 
        to: overallTo, 
        mode: overallMode, 
        legs, 
        status, 
        notes, 
        favorite,
        createdAt: editingId ? currentTrips.find(t=>t.id===editingId).createdAt : new Date().toISOString()
    };

    DOM.globalLoader.classList.remove('hidden');
    try {
        if (editingId) await DataStore.updateTrip(editingId, tripData);
        else await DataStore.addTrip(tripData);

        let locAdded = false;
        legs.forEach(l => {
            if (DataStore.addLocation(l.from)) locAdded = true;
            if (DataStore.addLocation(l.to)) locAdded = true;
        });

        DOM.tripModal.close();
        resetForm();
        
        await loadData();
        
        if (locAdded) updateLocationsDatalist();
        populateFilterDropdowns();
        applyFilters();
    } catch(err) {
        console.error(err);
        showError("Failed to save trip to MockAPI.");
    }
    DOM.globalLoader.classList.add('hidden');
}

function editTrip(id) {
    const trip = currentTrips.find(t => t.id === id);
    if (!trip) return;
    
    editingId = id;
    DOM.formTitle.textContent = "Edit Trip";
    DOM.tripId.value = trip.id;
    DOM.tripDate.value = trip.date;
    DOM.tripCost.value = trip.cost || '';
    DOM.tripStatus.value = trip.status;
    DOM.tripNotes.value = trip.notes || "";
    DOM.tripFavorite.checked = trip.favorite;
    
    DOM.legsContainer.innerHTML = '';
    
    // Backwards compatibility with old single-leg trips
    if (trip.legs && trip.legs.length > 0) {
        trip.legs.forEach((leg, index) => {
            DOM.legsContainer.appendChild(createLegRow(leg.from, leg.to, leg.mode, index === 0));
        });
    } else {
        DOM.legsContainer.appendChild(createLegRow(trip.from, trip.to, trip.mode, true));
    }
    
    DOM.formError.style.display = 'none';
    
    DOM.tripModal.showModal();
    DOM.tripDate.focus();
}

function resetForm() {
    editingId = null;
    DOM.tripForm.reset();
    DOM.formTitle.textContent = "Add a Trip";
    DOM.tripId.value = "";
    DOM.tripDate.value = new Date().toISOString().split('T')[0];
    DOM.tripCost.value = "";
    DOM.formError.style.display = 'none';
    
    DOM.legsContainer.innerHTML = '';
    DOM.legsContainer.appendChild(createLegRow('', '', 'Bus', true));
}

// === Custom Confirm Dialog ===
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmMessage');
        const okBtn = document.getElementById('okConfirmBtn');
        const cancelBtn = document.getElementById('cancelConfirmBtn');
        
        msgEl.textContent = message;
        modal.showModal();
        
        const handleOk = () => { cleanup(); resolve(true); };
        const handleCancel = () => { cleanup(); resolve(false); };
        
        const cleanup = () => {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.close();
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

async function deleteTrip(id) {
    const confirmed = await showConfirm("Are you sure you want to delete this trip? This action cannot be undone.");
    if (confirmed) {
        DOM.globalLoader.classList.remove('hidden');
        try {
            await DataStore.deleteTrip(id);
            await loadData();
            populateFilterDropdowns();
            applyFilters();
        } catch(err) {
            console.error(err);
            alert("Failed to delete trip");
        }
        DOM.globalLoader.classList.add('hidden');
    }
}

function viewCalendarDay(dateStr) {
    const dayTrips = filteredTrips.filter(t => t.date === dateStr);
    if (dayTrips.length === 0) return;
    
    DOM.calendarDayTitle.textContent = formatDate(dateStr);
    DOM.calendarDayTrips.innerHTML = '';
    
    dayTrips.forEach(t => {
        DOM.calendarDayTrips.innerHTML += `
            <div class="tl-item">
                <div class="tl-content" style="width: 100%;">
                    <div class="tl-header" style="justify-content: flex-end; margin-bottom: 0.5rem; gap: 0.5rem; align-items: center;">
                        <span class="badge ${t.status.toLowerCase()}">${t.status}</span>
                    </div>
                    ${generateVerticalTimeline(t)}
                    ${t.notes ? `<div class="tl-notes" style="margin-top:1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">${t.notes}</div>` : ''}
                    ${t.cost ? `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding-top:1rem; border-top: 1px dashed var(--border);">
                        <span style="color:var(--text-secondary); font-size:0.85rem; font-weight:500;">Total Cost</span>
                        <span style="font-weight:700; color:var(--text-primary); font-size:1.05rem;">₹ ${t.cost}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    });
    
    DOM.calendarDayModal.showModal();
}

// === Filtering Engine ===
function applyFilters() {
    tableCurrentPage = 1;
    const term = DOM.filterSearch.value.toLowerCase();
    const month = DOM.filterMonth.value;
    const year = DOM.filterYear.value;
    const route = DOM.filterRoute.value;
    const mode = DOM.filterMode.value;
    const status = DOM.filterStatus.value;
    const favOnly = DOM.filterFavorite.checked;

    const isFiltered = term || month || year || route || mode || status || favOnly;
    DOM.statsFilterLabel.style.display = isFiltered ? 'inline' : 'none';

    filteredTrips = currentTrips.filter(t => {
        let match = true;
        if (term) match = match && (t.notes.toLowerCase().includes(term) || t.date.includes(term) || t.from.toLowerCase().includes(term) || t.to.toLowerCase().includes(term));
        if (month) match = match && t.date.split('-')[1] === month;
        if (year) match = match && t.date.split('-')[0] === year;
        if (route) match = match && `${t.from} → ${t.to}` === route;
        
        // Multi-leg mode filtering: if any leg matches the mode, or if trip.mode matches
        if (mode) {
            if (t.legs) {
                match = match && t.legs.some(l => l.mode === mode);
            } else {
                match = match && t.mode === mode;
            }
        }
        
        if (status) match = match && t.status === status;
        if (favOnly) match = match && t.favorite === true;
        return match;
    });

    filteredTrips.sort((a, b) => {
        const d = new Date(b.date) - new Date(a.date);
        return d !== 0 ? d : new Date(b.createdAt) - new Date(a.createdAt);
    });

    renderAllViews();
}

function renderAllViews() {
    renderDashboard();
    renderStats();
    renderCalendar();
    renderTimeline();
}

// === Micro-Timeline Helpers ===
function getTripModeIcon(trip) {
    if (trip.mode === 'Mixed') {
        const uniqueModes = [...new Set(trip.legs.map(l => l.mode))];
        return uniqueModes.map(m => m === 'Bus' ? Icons.bus : Icons.train).join('');
    }
    return trip.mode === 'Bus' ? Icons.bus : Icons.train;
}

function generateMicroTimeline(trip) {
    if (!trip.legs || trip.legs.length <= 1) return '';
    
    let html = `<div class="tl-legs-breakdown">`;
    trip.legs.forEach((leg, i) => {
        const icon = leg.mode === 'Bus' ? Icons.bus : Icons.train;
        html += `<span>${leg.from} &rarr; ${leg.to} <span style="opacity:0.7">${icon}</span></span>`;
        if (i < trip.legs.length - 1) html += ` <span>&bull;</span> `;
    });
    html += `</div>`;
    return html;
}

function generateVerticalTimeline(trip) {
    let legs = trip.legs || [{ from: trip.from, to: trip.to, mode: trip.mode }];
    
    let html = `<div class="route-timeline">`;
    
    legs.forEach((leg, i) => {
        html += `
            <div class="rt-leg">
                <div class="rt-marker">
                    <div class="rt-dot ${i === 0 ? 'rt-dot-start' : ''}"></div>
                    <div class="rt-line"></div>
                </div>
                <div class="rt-content">
                    <div class="rt-city">${leg.from}</div>
                    <div class="rt-mode-chip" style="animation-delay: ${i * 0.1}s">
                        ${leg.mode === 'Bus' ? Icons.bus : Icons.train} 
                        <span>${leg.mode}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Final destination node
        if (i === legs.length - 1) {
            html += `
                <div class="rt-leg">
                    <div class="rt-marker">
                        <div class="rt-dot rt-dot-end"></div>
                    </div>
                    <div class="rt-content">
                        <div class="rt-city">${leg.to}</div>
                    </div>
                </div>
            `;
        }
    });
    
    html += `</div>`;
    return html;
}

window.toggleTimeline = function(event, id) {
    event.stopPropagation();
    const el = document.getElementById(id);
    if (el) {
        if (el.style.display === 'none') {
            // Close any currently open timelines first
            document.querySelectorAll('.td-route-timeline').forEach(tl => tl.style.display = 'none');
            
            el.style.display = 'block';
            // Re-trigger animations
            const chips = el.querySelectorAll('.rt-mode-chip');
            chips.forEach(chip => {
                chip.style.animation = 'none';
                chip.offsetHeight; /* trigger reflow */
                chip.style.animation = null; 
            });
        } else {
            el.style.display = 'none';
        }
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.td-route-timeline')) {
        document.querySelectorAll('.td-route-timeline').forEach(tl => tl.style.display = 'none');
    }
});

// === Render Functions ===

function renderDashboard() {
    DOM.statTotalTrips.textContent = filteredTrips.length;
    
    let totalSpent = 0;
    filteredTrips.forEach(t => totalSpent += (t.cost || 0));
    DOM.statTotalSpent.textContent = `₹ ${totalSpent.toLocaleString('en-IN')}`;
    
    let busLegs = 0;
    let trainLegs = 0;
    filteredTrips.forEach(t => {
        if (t.legs) {
            t.legs.forEach(l => {
                if (l.mode === 'Bus') busLegs++;
                if (l.mode === 'Train') trainLegs++;
            });
        } else {
            if (t.mode === 'Bus') busLegs++;
            if (t.mode === 'Train') trainLegs++;
        }
    });
    DOM.statModeSplit.textContent = `${busLegs} / ${trainLegs}`;

    const routeCounts = {};
    filteredTrips.forEach(t => {
        const route = `${t.from} → ${t.to}`;
        routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const uniqueRoutes = Object.keys(routeCounts).length;
    DOM.statUniqueRoutes.textContent = uniqueRoutes;
    
    if (uniqueRoutes > 0) {
        let topR = "", max = 0;
        for (let r in routeCounts) {
            if (routeCounts[r] > max) { max = routeCounts[r]; topR = r; }
        }
        DOM.statTopRoute.textContent = `${topR} · ${max}`;
    } else {
        DOM.statTopRoute.textContent = "—";
    }

    const now = new Date();
    const currM = String(now.getMonth() + 1).padStart(2, '0');
    const currY = String(now.getFullYear());
    
    DOM.statTripsMonth.textContent = filteredTrips.filter(t => t.date.startsWith(`${currY}-${currM}`)).length;
    DOM.statTripsYear.textContent = filteredTrips.filter(t => t.date.startsWith(currY)).length;

    const completed = filteredTrips.filter(t => t.status === 'Completed').sort((a,b) => new Date(b.date) - new Date(a.date));
    DOM.statLatestTrip.textContent = completed.length > 0 ? formatDate(completed[0].date) : "—";

    const planned = filteredTrips.filter(t => t.status === 'Planned' && new Date(t.date) >= new Date().setHours(0,0,0,0)).sort((a,b) => new Date(a.date) - new Date(b.date));
    DOM.statNextTrip.textContent = planned.length > 0 ? formatDate(planned[0].date) : "—";
}


function renderStats() {
    const completed = filteredTrips.filter(t => t.status === 'Completed');
    
    let maxGap = 0;
    if (completed.length >= 2) {
        const sortedDates = completed.map(t => new Date(t.date)).sort((a,b) => a-b);
        for(let i = 1; i < sortedDates.length; i++) {
            const gap = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
            if (gap > maxGap) maxGap = gap;
        }
    }

    let busLegs = 0;
    let trainLegs = 0;
    filteredTrips.forEach(t => {
        if (t.legs) {
            t.legs.forEach(l => {
                if (l.mode === 'Bus') busLegs++;
                if (l.mode === 'Train') trainLegs++;
            });
        } else {
            if (t.mode === 'Bus') busLegs++;
            if (t.mode === 'Train') trainLegs++;
        }
    });

    let topMode = '—';
    if (busLegs > 0 || trainLegs > 0) {
        topMode = busLegs >= trainLegs ? `<span class="icon-bus">${Icons.bus}</span> Bus` : `<span class="icon-train">${Icons.train}</span> Train`;
    }

    DOM.statsOverview.innerHTML = `
        <div>
            <div class="stat-item-label">Total Travel Days</div>
            <div class="stat-item-val">${new Set(filteredTrips.map(t=>t.date)).size}</div>
        </div>
        <div>
            <div class="stat-item-label">Longest Gap</div>
            <div class="stat-item-val">${maxGap} days</div>
        </div>
        <div>
            <div class="stat-item-label">Most Used Mode</div>
            <div class="stat-item-val" style="display:flex;align-items:center;gap:0.25rem">${topMode}</div>
        </div>
        <div>
            <div class="stat-item-label">Planned vs Completed</div>
            <div class="stat-item-val">${filteredTrips.filter(t=>t.status==='Planned').length} / ${completed.length}</div>
        </div>
    `;

    const routeCounts = {};
    filteredTrips.forEach(t => {
        const route = `${t.from} → ${t.to}`;
        routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    
    const sortedRoutes = Object.entries(routeCounts).sort((a,b) => b[1] - a[1]);
    const maxVal = sortedRoutes.length > 0 ? sortedRoutes[0][1] : 1;

    DOM.routeBarChart.innerHTML = '';
    if (sortedRoutes.length === 0) {
        DOM.routeBarChart.innerHTML = '<p class="text-muted">No data available.</p>';
        return;
    }

    sortedRoutes.slice(0, 10).forEach(([route, count]) => {
        const pct = (count / maxVal) * 100;
        DOM.routeBarChart.innerHTML += `
            <div class="bar-row">
                <div class="bar-label" title="${route}">${route}</div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: 0%;" data-width="${pct}%"></div>
                </div>
                <div class="bar-value">${count}</div>
            </div>
        `;
    });

    setTimeout(() => {
        document.querySelectorAll('.bar-fill').forEach(el => {
            el.style.width = el.dataset.width;
        });
    }, 50);
}

function renderCalendar() {
    DOM.calendarGrid.innerHTML = '';
    const date = new Date(currentYear, currentMonth, 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    DOM.calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const startDay = date.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    
    for (let i = 0; i < startDay; i++) {
        DOM.calendarGrid.innerHTML += `<div class="cal-day empty"></div>`;
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTrips = filteredTrips.filter(t => t.date === dStr);
        
        const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        let html = `<div class="cal-day ${isToday ? 'today' : ''}" ${dayTrips.length ? `onclick="viewCalendarDay('${dStr}')"` : ''}>
            <div class="day-num">${i}</div>
            <div class="cal-indicators">`;
            
        dayTrips.forEach(t => {
            if (t.status === 'Planned') {
                html += `<div class="cal-indicator" title="${t.from} → ${t.to}">${Icons.clock} <span>${t.to}</span></div>`;
            } else {
                if (t.legs && t.legs.length > 1) {
                    html += `<div class="cal-indicator" title="${t.from} → ${t.to}" style="color:var(--text-primary)">${getTripModeIcon(t)} <span>${t.to}</span></div>`;
                } else {
                    const indClass = t.mode === 'Bus' ? 'ind-bus' : 'ind-train';
                    const icon = t.mode === 'Bus' ? Icons.bus : Icons.train;
                    html += `<div class="cal-indicator ${indClass}" title="${t.from} → ${t.to}">${icon} <span>${t.to}</span></div>`;
                }
            }
        });
        
        html += `</div></div>`;
        DOM.calendarGrid.innerHTML += html;
    }
}

function renderTimeline() {
    DOM.timelineContainer.innerHTML = '';
    if (filteredTrips.length === 0) {
        DOM.timelineContainer.style.display = 'none';
        DOM.timelinePagination.style.display = 'none';
        DOM.timelineEmpty.style.display = 'block';
        return;
    }
    
    DOM.timelineContainer.style.display = 'block';
    DOM.timelineEmpty.style.display = 'none';

    // Pagination logic
    const totalPages = Math.ceil(filteredTrips.length / timelineItemsPerPage);
    if (timelineCurrentPage > totalPages) timelineCurrentPage = totalPages;
    if (timelineCurrentPage < 1) timelineCurrentPage = 1;
    
    const startIndex = (timelineCurrentPage - 1) * timelineItemsPerPage;
    const endIndex = startIndex + timelineItemsPerPage;
    const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

    // Group PAGINATED trips by Month/Year
    const grouped = {};
    paginatedTrips.forEach(t => {
        const dateObj = new Date(t.date + "T00:00:00Z");
        const monthYear = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        if (!grouped[monthYear]) grouped[monthYear] = [];
        grouped[monthYear].push(t);
    });

    let html = '';
    for (const [monthYear, trips] of Object.entries(grouped)) {
        html += `<div class="tl-month-group">
            <h3 class="tl-month-header">${monthYear}</h3>`;
        
        trips.forEach(t => {
            const favIcon = t.favorite ? `<span style="color:#eab308">${Icons.starFilled}</span>` : `<span style="color:var(--text-secondary)">${Icons.star}</span>`;
            
            html += `
                <div class="tl-item" ${t.favorite ? 'style="border:1px solid rgba(234, 179, 8, 0.5); border-radius:12px; padding:0.5rem; background:rgba(234, 179, 8, 0.05); margin-left:-0.5rem;"' : ''}>
                    <div class="tl-dot" style="display:flex;gap:2px;align-items:center;">${getTripModeIcon(t)}</div>
                    <div class="tl-content">
                        <div class="tl-header" style="justify-content: space-between; align-items: center; margin-bottom:0.5rem;">
                            <span class="tl-date" style="font-weight:500;">${formatDate(t.date)}</span>
                            <span class="badge ${t.status.toLowerCase()}">${t.status}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:1rem;">
                            <div style="font-weight:600; color:var(--text-primary); font-size:1.05rem; display:flex; align-items:center; gap:0.35rem;">
                                ${t.from} <span style="color:var(--text-secondary);">&rarr;</span> ${t.to}
                            </div>
                            ${t.legs && t.legs.length > 1 ? `<button class="btn outline sm" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;" onclick="toggleTimeline(event, 'tl-${t.id}')">Details</button>` : ''}
                        </div>
                        <div id="tl-${t.id}" style="display:none;">
                            ${generateVerticalTimeline(t)}
                        </div>
                        ${t.notes ? `<div class="tl-notes" style="margin-top:1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">${t.notes}</div>` : ''}
                        
                        <!-- Footer block with cost and action buttons -->
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:1.5rem; padding-top:1rem; border-top: 1px dashed var(--border);">
                            <div class="action-buttons" style="display:flex; gap:0.25rem;">
                                <button class="icon-btn" style="padding:0.35rem;" onclick="toggleFavorite('${t.id}')" title="Favorite">${favIcon}</button>
                                <button class="icon-btn" style="padding:0.35rem; color:var(--info)" onclick="editTrip('${t.id}')" title="Edit Trip">${Icons.edit}</button>
                                <button class="icon-btn danger" style="padding:0.35rem;" onclick="deleteTrip('${t.id}')" title="Delete Trip">${Icons.delete}</button>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:700; color:${t.cost ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-size:1.05rem;">₹ ${t.cost || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    
    DOM.timelineContainer.innerHTML = html;
    
    renderTimelinePaginationControls(totalPages);
}

function renderTimelinePaginationControls(totalPages) {
    if (filteredTrips.length === 0) {
        DOM.timelinePagination.style.display = 'none';
        return;
    }
    
    DOM.timelinePagination.style.display = 'flex';
    let html = `<button class="page-btn" ${timelineCurrentPage === 1 ? 'disabled' : ''} onclick="changeTimelinePage(${timelineCurrentPage - 1})">Prev</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 5) {
            if (i === 1 || i === totalPages || (i >= timelineCurrentPage - 1 && i <= timelineCurrentPage + 1)) {
                html += `<button class="page-btn ${i === timelineCurrentPage ? 'active' : ''}" onclick="changeTimelinePage(${i})">${i}</button>`;
            } else if (i === timelineCurrentPage - 2 || i === timelineCurrentPage + 2) {
                html += `<span style="color:var(--text-secondary)">...</span>`;
            }
        } else {
            html += `<button class="page-btn ${i === timelineCurrentPage ? 'active' : ''}" onclick="changeTimelinePage(${i})">${i}</button>`;
        }
    }
    
    html += `<button class="page-btn" ${timelineCurrentPage === totalPages ? 'disabled' : ''} onclick="changeTimelinePage(${timelineCurrentPage + 1})">Next</button>`;
    
    DOM.timelinePageControls.innerHTML = html;
}

window.changeTimelinePage = function(page) {
    timelineCurrentPage = page;
    renderTimeline();
}

window.changeTimelineItemsPerPage = function() {
    timelineItemsPerPage = parseInt(DOM.timelineItemsPerPage.value, 10);
    timelineCurrentPage = 1;
    renderTimeline();
}

window.toggleTimeline = function(event, id) {
    if (event) event.stopPropagation();
    const el = document.getElementById(id);
    if (el) {
        if (el.style.display === 'none') {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
}

// === Utils ===
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr + "T00:00:00Z");
    return date.toLocaleDateString(undefined, options);
}

// === Export / Import ===
function exportJSON() {
    const dataStr = JSON.stringify(currentTrips, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadBlob(dataBlob, `travel_log_backup_${new Date().toISOString().slice(0,10)}.json`);
}

function exportCSV() {
    if (currentTrips.length === 0) return;
    const headers = Object.keys(currentTrips[0]).join(',');
    const rows = currentTrips.map(t => Object.values(t).map(v => typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : `"${v}"`).join(',')).join('\n');
    const csvStr = `${headers}\n${rows}`;
    const dataBlob = new Blob([csvStr], { type: 'text/csv' });
    downloadBlob(dataBlob, `travel_log_${new Date().toISOString().slice(0,10)}.csv`);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

let uploadedData = null;
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            uploadedData = JSON.parse(evt.target.result);
            if (Array.isArray(uploadedData)) {
                DOM.importStatus.textContent = `File loaded: ${uploadedData.length} trips found. Ready to import.`;
                DOM.importStatus.className = 'import-status success';
                DOM.restoreBtn.style.display = 'inline-block';
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            DOM.importStatus.textContent = "Error: Invalid JSON file.";
            DOM.importStatus.className = 'import-status error';
            DOM.restoreBtn.style.display = 'none';
        }
    };
    reader.readAsText(file);
}

async function processImport() {
    if (!uploadedData) return;
    DOM.globalLoader.classList.remove('hidden');
    let added = 0;
    
    // Process sequentially to avoid API rate limits
    for (const newTrip of uploadedData) {
        const isDup = currentTrips.some(t => 
            t.date === newTrip.date && 
            t.from.toLowerCase() === newTrip.from.toLowerCase() && 
            t.to.toLowerCase() === newTrip.to.toLowerCase() && 
            t.mode === newTrip.mode
        );
        if (!isDup) {
            delete newTrip.id; // Let MockAPI assign the ID
            try {
                await DataStore.addTrip(newTrip);
                
                if (newTrip.legs) {
                    newTrip.legs.forEach(l => {
                        DataStore.addLocation(l.from);
                        DataStore.addLocation(l.to);
                    });
                } else {
                    DataStore.addLocation(newTrip.from);
                    DataStore.addLocation(newTrip.to);
                }
                
                added++;
            } catch (err) {
                console.error("Failed to import trip", newTrip);
            }
        }
    }
    
    await loadData();
    populateFilterDropdowns();
    updateLocationsDatalist();
    applyFilters();
    
    DOM.importStatus.textContent = `Import successful. Added ${added} new trips. skipped duplicates.`;
    DOM.restoreBtn.style.display = 'none';
    DOM.globalLoader.classList.add('hidden');
}

async function confirmClearData() {
    const confirmed = await showConfirm("WARNING: This will permanently delete ALL your travel data from the cloud. Proceed?");
    if (confirmed) {
        DOM.globalLoader.classList.remove('hidden');
        
        for (const t of currentTrips) {
            try { await DataStore.deleteTrip(t.id); } 
            catch (err) { console.error("Failed to delete", t.id); }
        }
        
        localStorage.removeItem('travelLogLocations');
        
        await loadData();
        updateLocationsDatalist();
        populateFilterDropdowns();
        applyFilters();
        
        DOM.importStatus.textContent = "All data cleared from cloud.";
        DOM.importStatus.className = 'import-status error';
        DOM.globalLoader.classList.add('hidden');
    }
}

// Start app
init();
