const display = document.getElementById('display');
const keys = document.getElementById('keys');

let expression = '';

function refreshDisplay() {
    display.value = expression || '0';
}

function appendValue(value) {
    if (value === '.' && /(^|[+\-*/])\d*\./.test(expression.split(/([+\-*/])/).pop())) {
        return;
    }
    expression += value;
}

function clearAll() {
    expression = '';
}

function deleteLast() {
    expression = expression.slice(0, -1);
}

function calculate() {
    if (!expression.trim()) return;

    try {
        const result = Function(`"use strict"; return (${expression})`)();
        expression = Number.isFinite(result) ? String(result) : '';
    } catch {
        expression = '';
        display.value = 'Error';
        return;
    }

    refreshDisplay();
}

keys.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const { action, value } = target.dataset;

    if (action === 'clear') clearAll();
    else if (action === 'delete') deleteLast();
    else if (action === 'equals') return calculate();
    else if (value) appendValue(value);

    refreshDisplay();
});

refreshDisplay();
