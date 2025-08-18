import { monsters, top5Monsters, top10Monsters, top15Monsters } from './assets/monsters.js';

const grid = document.getElementById('monster-grid');
const filter = document.getElementById('monster-filter');

function renderMonsters(monsterArray) {
    grid.innerHTML = ''; // Clear existing content
    monsterArray.forEach(monster => {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.innerHTML = `
            <div class="portrait-container">
                <img src="assets/Monster Portraits/${monster.image}" alt="${monster.name}" class="monster-img">
            </div>
            <div class="monster-name">${monster.name}</div>
        `;
        grid.appendChild(card);
    });
}

// Initial render with all monsters
renderMonsters(monsters);

// Filter change handler
filter.addEventListener('change', () => {
    switch(filter.value) {
        case 'top5':
            renderMonsters(top5Monsters);
            break;
        case 'top10':
            renderMonsters(top10Monsters);
            break;
        case 'top15':
            renderMonsters(top15Monsters);
            break;
        default:
            renderMonsters(monsters);
    }
});
