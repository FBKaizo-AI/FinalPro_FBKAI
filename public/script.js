import { Monsters } from "./assets/monsters.js";
import { calc } from "./lvl_calc.js";
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

//Monster Search Dropdown
const searchInput = document.getElementById('monster-search-input');
const dropdown = document.getElementById('monster-dropdown');
const monsterCard = document.getElementById('monster-card');

function initializeMonsterSearch(query) {
    query = query.toLowerCase();
    dropdown.innerHTML = '';
    if (!query) {
        dropdown.classList.remove('show');
        return;
    }
    const filtered = Monsters.filter(m => m.monsterName.toLowerCase().includes(query));
    if (filtered.length === 0) {
        dropdown.classList.remove('show');
        return;
    }
    filtered.forEach(monster => {
        const li = document.createElement('li');
        li.textContent = monster.monsterName;
        li.addEventListener('click', () => {
            showMonsterCard(monster);
            dropdown.classList.remove('show');
            searchInput.value = monster.monsterName;
        });
        dropdown.appendChild(li);
    });
    dropdown.classList.add('show');
}

searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = this.value.trim().toLowerCase();
        const exactMatchMonster = Monsters.find((m) => m.monsterName.toLowerCase() === query);
        if (exactMatchMonster) {
            showMonsterCard(exactMatchMonster);
            dropdown.classList.remove("show");
            dropdown.innerHTML = "";
            searchInput.value = exactMatchMonster.monsterName;
        } else {
            dropdown.classList.remove("show");
            dropdown.innerHTML = "";
        }
    }
});

searchInput.addEventListener('input', function() {
    initializeMonsterSearch(this.value);
});

document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

function displayValue(val) {
    if (val === -1 || val === "No Effect") return "-";
    return val;
}

function showMonsterCard(monster) {
    document.getElementById('monster-portrait').src = monster.portrait;
    document.getElementById('monster-portrait').alt = monster.monsterName + ' portrait';
    document.getElementById('monster-name').textContent = monster.monsterName;
    document.getElementById('monster-class').textContent = monster.class;
    document.getElementById('monster-gt').textContent = displayValue(monster.gt);
    document.getElementById('monster-hp').textContent = displayValue(monster.hp);
    document.getElementById('monster-ap').textContent = displayValue(monster.ap);
    document.getElementById('monster-atk').textContent = displayValue(monster.atk);
    document.getElementById('monster-def').textContent = displayValue(monster.def);
    document.getElementById('monster-luck').textContent = displayValue(monster.luck);
    document.getElementById('monster-speed').textContent = displayValue(monster.speed);
    document.getElementById('monster-battle-art').textContent = 
        `${displayValue(monster.attackEffect)} (${displayValue(monster.attackEffectUnlockLvl)})`;
    document.getElementById('monster-special-name').textContent = displayValue(monster.specialName);
    document.getElementById('monster-special-desc').textContent = displayValue(monster.specialEffect);
    document.getElementById('monster-ability-1').textContent = 
        `${displayValue(monster.ability1)} (${displayValue(monster.ability1UnlockLvl)})`;
    document.getElementById('monster-ability-2').textContent = 
        `${displayValue(monster.ability2)} (${displayValue(monster.ability2UnlockLvl)})`;
    document.getElementById('monster-ability-3').textContent = 
        `${displayValue(monster.ability3)} (${displayValue(monster.ability3UnlockLvl)})`;
    monsterCard.classList.remove('hidden');

    document.getElementById('level-calc-container').classList.remove('hidden');

    // Set default level to 1
    const levelInput = document.getElementById('level-input');
    levelInput.value = 1;
    updateStatsWithCalc(monster, 1);

    // Add event listener for level changes
    levelInput.oninput = function() {
        let lvl = parseInt(levelInput.value, 10);
        if (isNaN(lvl) || lvl < 1) lvl = 1;
        if (lvl > 99) lvl = 99;
        updateStatsWithCalc(monster, lvl);
    };
}

function updateStatsWithCalc(monster, level) {
    // Use your calc function to get new stats
    const [Hp, Atk, Def, Ap] = calc(monster, level);
    document.getElementById('monster-hp').textContent = displayValue(Hp);
    document.getElementById('monster-atk').textContent = displayValue(Atk);
    document.getElementById('monster-def').textContent = displayValue(Def);
    document.getElementById('monster-ap').textContent = displayValue(Ap);
}

// --- Chat Functionality ---
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// Updated appendMessage with Markdown for bot messages
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ' + sender;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble ' + sender;

    if (sender === 'bot') {
        bubble.innerHTML = marked(text); // parse markdown to HTML
    } else {
        bubble.textContent = text; // plain text for user
    }

    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    appendMessage('user', userMsg);  // Show user message
    chatInput.value = '';

    appendMessage('bot', 'Thinking...');

    try {
        console.log('Sending to backend:', userMsg);

        const response = await fetch('http://localhost:3000/api/ai-output', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: userMsg })
        });

        const data = await response.json();
        console.log('Parsed backend response:', data);

        // Remove the "Thinking..." message
        const loadingMessages = document.querySelectorAll('.bot');
        if (loadingMessages.length > 0) {
            chatWindow.removeChild(loadingMessages[loadingMessages.length - 1].parentNode);
        }

        if (response.ok) {
            appendMessage('bot', data.answer); // Markdown handled inside appendMessage()
        } else {
            appendMessage('bot', `Error: ${data.error || 'Failed to get AI response'}`);
        }

    } catch (error) {
        console.error('Fetch error:', error);
        appendMessage('bot', 'Error connecting to the server.');
    }
});

// --- Welcome Message ---
appendMessage('bot', "Welcome to FBKaizo AI! I'm your Yu-Gi-Oh! The Falsebound Kingdom assistant. Ask me about any monster's stats, skills, or strategic information.");
