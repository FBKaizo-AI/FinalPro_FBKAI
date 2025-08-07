// --- Sample Monster Data ---
const monsters = [
    {
        name: "Blue-Eyes White Dragon",
        portrait: "./assets/BEWD.png",//<--Temporary porttrait
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
        portrait: "./assets/DM.png",//<--Temporary portrait
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

    //
];

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
        event.preventDefault();
        const query = this.value.trim().toLowerCase();
        const exactMatchMonster = monsters.find((m) => m.name.toLowerCase() === query);
        if (exactMatchMonster) {
            showMonsterCard(exactMatchMonster);
            dropdown.classList.remove("show");
            dropdown.innerHTML = "";
            searchInput.value = exactMatchMonster.name;
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


// Replaced placeholder AI logic with real fetch POST request to backend API.-MS
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

        // Log the raw response object
        console.log('Raw fetch response:', response);

        const data = await response.json();

        console.log('Parsed backend response:', data);

        // Remove the "Thinking..." message
        const loadingMessages = document.querySelectorAll('.bot');
        if (loadingMessages.length > 0) {
            chatWindow.removeChild(loadingMessages[loadingMessages.length - 1].parentNode);
        }

        if (response.ok) {
            appendMessage('bot', data.answer);
        } else {
            appendMessage('bot', `Error: ${data.error || 'Failed to get AI response'}`);
        }

    } catch (error) {
        console.error('Fetch error:', error);
        appendMessage('bot', 'Error connecting to the server.');
    }
});

// --- Welcome Message (Kept) ---
appendMessage('bot', "Welcome to FBKaizo AI! I'm your Yu-Gi-Oh! The Falsebound Kingdom assistant. Ask me about any monster's stats, skills, or strategic information.");
