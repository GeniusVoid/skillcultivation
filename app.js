// --- DATA & STATE ---
let history = JSON.parse(localStorage.getItem('sc_history')) || [];
let config = JSON.parse(localStorage.getItem('sc_config')) || { silverToBronze: 50, goldToSilver: 10 };
let selectedLogIndex = null;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rateSilver').value = config.silverToBronze;
    document.getElementById('rateGold').value = config.goldToSilver;
    updateTotalDisplay();
});

// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'log') renderLogs();
}

function openAddScreen() {
    document.getElementById('formTitle').innerText = "Cultivate Skill";
    document.getElementById('editIndex').value = "-1"; 
    document.getElementById('coinQty').value = '';
    document.getElementById('coinDesc').value = '';
    document.getElementById('coinType').value = 'bronze';
    showSection('add');
}

// --- LOGIC ---
function saveSettings() {
    const sRate = parseInt(document.getElementById('rateSilver').value) || 50;
    const gRate = parseInt(document.getElementById('rateGold').value) || 10;
    config = { silverToBronze: sRate, goldToSilver: gRate };
    localStorage.setItem('sc_config', JSON.stringify(config));
    updateTotalDisplay();
    alert("Conversion rates updated.");
}

function updateTotalDisplay() {
    let totalBronze = 0;
    history.forEach(item => {
        let val = item.qty;
        if (item.type === 'silver') val = item.qty * config.silverToBronze;
        if (item.type === 'gold') val = item.qty * config.goldToSilver * config.silverToBronze;
        totalBronze += val;
    });
    document.getElementById('totalCoins').innerText = totalBronze;
}

function saveCoin() {
    const qty = parseInt(document.getElementById('coinQty').value);
    const desc = document.getElementById('coinDesc').value;
    const type = document.getElementById('coinType').value;
    const editIdx = parseInt(document.getElementById('editIndex').value);

    if (!qty || !desc) return alert("Fill all fields");

    const entry = {
        type: type,
        qty: qty,
        desc: desc,
        time: editIdx === -1 ? new Date().toLocaleString() : history[editIdx].time
    };

    if (editIdx === -1) {
        history.unshift(entry);
    } else {
        history[editIdx] = entry;
    }

    localStorage.setItem('sc_history', JSON.stringify(history));
    updateTotalDisplay();
    showSection('home');
}

// --- RENDER LOG ---
function renderLogs() {
    const list = document.getElementById('logList');
    list.innerHTML = '';
    
    if(history.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#666">No records.</p>';
        return;
    }

    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'log-item';
        div.style.borderLeftColor = getTypeColor(item.type);

        // Add Long Press & Click Events
        div.oncontextmenu = (e) => { e.preventDefault(); openActionSheet(index); };
        addLongPress(div, index);

        div.innerHTML = `
            <div class="log-header">
                <span class="log-time">${item.time}</span>
                <div class="three-dots" onclick="openActionSheet(${index})">⋮</div>
            </div>
            <div class="log-desc">${item.desc}</div>
            <div class="log-qty text-${item.type}">+${item.qty} ${item.type.toUpperCase()}</div>
        `;
        list.appendChild(div);
    });
}

function getTypeColor(type) {
    if(type === 'gold') return 'var(--gold)';
    if(type === 'silver') return 'var(--silver)';
    return 'var(--bronze)'; // or var(--primary) for default
}

// --- ACTION MENU ---
function openActionSheet(index) {
    selectedLogIndex = index;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('actionSheet').style.display = 'block';
}

function closeActionSheet() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('actionSheet').style.display = 'none';
}

function deleteSelectedLog() {
    if(confirm("Delete this log permanently?")) {
        history.splice(selectedLogIndex, 1);
        localStorage.setItem('sc_history', JSON.stringify(history));
        updateTotalDisplay();
        renderLogs();
    }
    closeActionSheet();
}

function editSelectedLog() {
    const item = history[selectedLogIndex];
    document.getElementById('formTitle').innerText = "Edit Cultivation";
    document.getElementById('editIndex').value = selectedLogIndex;
    document.getElementById('coinType').value = item.type;
    document.getElementById('coinQty').value = item.qty;
    document.getElementById('coinDesc').value = item.desc;
    closeActionSheet();
    showSection('add');
}

function addLongPress(element, index) {
    let pressTimer;
    element.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => openActionSheet(index), 600);
    });
    element.addEventListener('touchend', () => clearTimeout(pressTimer));
    element.addEventListener('touchmove', () => clearTimeout(pressTimer));
}

