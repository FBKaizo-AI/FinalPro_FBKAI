// --- Sample Monster Data (replace with real data as needed) ---
const monsters = [
    {
        name: "Blue-Eyes White Dragon",
        portrait: "./assets/BEWD.png", // Example image
        class: "Dragon",
        hp: 1900,
        atk: 3000,
        def: 2500,
        ap: 2,
        gt: 2,
        luck: 5,
        speed: 180,
        battleArt: "Dragon-Killer 2 (20)",
        specialName: "-",
        specialDesc: "-",
        ability1: "Mountain Adept (1)",
        ability2: "Castle Adept (15)",
        ability3: "Armor (35)"
    },
    {
        name: "Dark Magician",
        portrait: "./assets/DM.png", // Example image
        class: "Spellcaster",
        hp: 1200,
        atk: 2500,
        def: 2100,
        ap: 2,
        gt: 18,
        luck: 10,
        speed: 90,
        battleArt: "-",
        specialName: "Dark Burning Magic (40)",
        specialDesc: "Combo Attack W/ DMG",
        ability1: "Night Adept (1)",
        ability2: "Offensive Magic (1)",
        ability3: "Defensive Magic (1)"
    }
    // Add more monsters as needed
];

// --- Monster Search Dropdown ---

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
    const filtered = monsters.filter(m => m.name.toLowerCase().includes(query));
    if (filtered.length === 0) {
        dropdown.classList.remove('show');
        return;
    }
    filtered.forEach(monster => {
        const li = document.createElement('li');
        li.textContent = monster.name;
        li.addEventListener('click', () => {
            showMonsterCard(monster);
            dropdown.classList.remove('show');
            searchInput.value = monster.name;
        });
        dropdown.appendChild(li);
    });
    dropdown.classList.add('show');
}

searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission if inside a form
        initializeMonsterSearch(searchInput.value);
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

function showMonsterCard(monster) {
    document.getElementById('monster-portrait').src = monster.portrait;
    document.getElementById('monster-portrait').alt = monster.name + ' portrait';
    document.getElementById('monster-name').textContent = monster.name;
    document.getElementById('monster-class').textContent = monster.class;
    document.getElementById('monster-hp').textContent = monster.hp;
    document.getElementById('monster-atk').textContent = monster.atk;
    document.getElementById('monster-def').textContent = monster.def;
    document.getElementById('monster-ap').textContent = monster.ap;
    document.getElementById('monster-gt').textContent = monster.gt;
    document.getElementById('monster-luck').textContent = monster.luck;
    document.getElementById('monster-speed').textContent = monster.speed;
    document.getElementById('monster-battle-art').textContent = monster.battleArt;
    document.getElementById('monster-special-name').textContent = monster.specialName;
    document.getElementById('monster-special-desc').textContent = monster.specialDesc;
    document.getElementById('monster-ability-1').textContent = monster.ability1;
    document.getElementById('monster-ability-2').textContent = monster.ability2;
    document.getElementById('monster-ability-3').textContent = monster.ability3;
    monsterCard.classList.remove('hidden');
}

// --- Chat Functionality ---
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ' + sender;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble ' + sender;
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    appendMessage('user', userMsg);
    chatInput.value = '';
    // Simulate AI response (replace with real API call)
    setTimeout(() => {
        appendMessage('bot', getBotResponse(userMsg));
    }, 700);
});

function getBotResponse(userMsg) {
    // Placeholder logic for demo
    if (userMsg.toLowerCase().includes('blue-eyes')) {
        return "Blue-Eyes White Dragon is a powerful dragon with 3000 ATK and 2500 DEF. Would you like to know more?";
    }
    if (userMsg.toLowerCase().includes('dark magician')) {
        return "Dark Magician is a classic spellcaster with 2500 ATK and 2100 DEF. Need more details?";
    }
    return "I'm FBKaizo AI! Ask me about any monster's stats, skills, or strategic information.";
}

// Optionally, show a welcome message
appendMessage('bot', "Welcome to FBKaizo AI! I'm your Yu-Gi-Oh! The Falsebound Kingdom assistant. Ask me about any monster's stats, skills, or strategic information. What would you like to know?");
