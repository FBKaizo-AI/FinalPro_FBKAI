import { Monsters } from "./assets/monsters.js";
import { calc, hpCalc, atkDefCalc, apCalc } from "./lvl_calc.js";

let selectedMonsters = [null, null];

function setupMonsterCard(cardHolder, idx) {
    const searchInput = cardHolder.querySelector('.monster-search-input');
    const dropdown = cardHolder.querySelector('.monster-dropdown');
    const monsterCard = cardHolder.querySelector('.monster-card');
    const levelCalcContainer = cardHolder.querySelector('.level-calc-container');
    const levelInput = cardHolder.querySelector('.level-input');

    //monster card info
    const portrait = cardHolder.querySelector('.monster-portrait');
    const nameField = cardHolder.querySelector('.monster-name');
    const classField = cardHolder.querySelector('.monster-class');
    const gtField = cardHolder.querySelector('.monster-gt');
    const hpField = cardHolder.querySelector('.monster-hp');
    const apField = cardHolder.querySelector('.monster-ap');
    const atkField = cardHolder.querySelector('.monster-atk');
    const defField = cardHolder.querySelector('.monster-def');
    const luckField = cardHolder.querySelector('.monster-luck');
    const speedField = cardHolder.querySelector('.monster-speed');
    const battleArtField = cardHolder.querySelector('.monster-battle-art');
    const specialNameField = cardHolder.querySelector('.monster-special-name');
    const specialDescField = cardHolder.querySelector('.monster-special-desc');
    const ability1Field = cardHolder.querySelector('.monster-ability-1');
    const ability2Field = cardHolder.querySelector('.monster-ability-2');
    const ability3Field = cardHolder.querySelector('.monster-ability-3');

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
                dropdown.innerHTML = '';
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
        portrait.src = monster.portrait;
        portrait.alt = monster.monsterName + ' portrait';
        nameField.textContent = monster.monsterName;
        classField.textContent = monster.class;
        gtField.textContent = displayValue(monster.gt);
        hpField.textContent = displayValue(monster.hp);
        apField.textContent = displayValue(monster.ap);
        atkField.textContent = displayValue(monster.atk);
        defField.textContent = displayValue(monster.def);
        luckField.textContent = displayValue(monster.luck);
        speedField.textContent = displayValue(monster.speed);
        battleArtField.textContent = `${displayValue(monster.attackEffect)} (${displayValue(monster.attackEffectUnlockLvl)})`;
        specialNameField.textContent = displayValue(monster.specialName);
        specialDescField.textContent = displayValue(monster.specialEffect);
        ability1Field.textContent = `${displayValue(monster.ability1)} (${displayValue(monster.ability1UnlockLvl)})`;
        ability2Field.textContent = `${displayValue(monster.ability2)} (${displayValue(monster.ability2UnlockLvl)})`;
        ability3Field.textContent = `${displayValue(monster.ability3)} (${displayValue(monster.ability3UnlockLvl)})`;
        monsterCard.classList.remove('hidden');
        levelCalcContainer.classList.remove('hidden');

        // Set default level to 1
        levelInput.value = 1;
        updateStatsWithCalc(monster, 1);

        // Add event listener for level changes on card
        levelInput.oninput = function() {
            let lvl = parseInt(levelInput.value, 10);
            if (isNaN(lvl) || lvl < 1) lvl = 1;
            if (lvl > 99) lvl = 99;
            updateStatsWithCalc(monster, lvl);
            compareStatsAndColor();
        };

        // --- NEW: Comparison and Graph Logic ---
        selectedMonsters[idx] = monster;
        drawIndividualGraph(idx, monster);
        compareStatsAndColor();
        drawComparisonGraphs();
    }

    function updateStatsWithCalc(monster, level) {
        const [Hp, Atk, Def, Ap] = calc(monster, level);
        hpField.textContent = displayValue(Hp);
        atkField.textContent = displayValue(Atk);
        defField.textContent = displayValue(Def);
        apField.textContent = displayValue(Ap);
    }

    // Individual stat graph below each card
    function drawIndividualGraph(idx, monster) {
        const canvas = document.getElementById(`stat-graph-${idx + 1}`);
        if (!canvas) return; // Prevent error if canvas is missing
        const { hpArr, atkArr, defArr } = getStatGrowthArrays(monster);
        const ctx = canvas.getContext('2d');
        if (window[`statChart${idx}`]) window[`statChart${idx}`].destroy();
        window[`statChart${idx}`] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 99}, (_, i) => i + 1),
                datasets: [
                    { label: 'HP', data: hpArr, borderColor: '#00eaff', backgroundColor: 'rgba(0,234,255,0.1)', tension: 0.2 },
                    { label: 'ATK', data: atkArr, borderColor: '#ff6384', backgroundColor: 'rgba(255,99,132,0.1)', tension: 0.2 },
                    { label: 'DEF', data: defArr, borderColor: '#00ff00', backgroundColor: 'rgba(0,255,0,0.1)', tension: 0.2 }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#fff',
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Level', color: '#fff', font: { size: 16, weight: 'bold' } },
                        ticks: { color: '#fff', font: { size: 14, weight: 'bold' } }
                    },
                    y: {
                        title: { display: true, text: 'Stat Value', color: '#fff', font: { size: 16, weight: 'bold' } },
                        ticks: { color: '#fff', font: { size: 14, weight: 'bold' } }
                    }
                }
            }
        });
    }
}

// Stat coloring
function compareStatsAndColor() {
    if (!selectedMonsters[0] || !selectedMonsters[1]) return;
    const stats = ['hp', 'ap', 'atk', 'def'];
    stats.forEach(stat => {
        const leftVal = document.querySelector('.card-holder:nth-child(1) .monster-' + stat).textContent;
        const rightVal = document.querySelector('.card-holder:nth-child(2) .monster-' + stat).textContent;
        if (Number(leftVal) > Number(rightVal)) {
            setStatColor(1, stat, '#39ff14');
            setStatColor(2, stat, '#ff3b3b');
        } else if (Number(leftVal) < Number(rightVal)) {
            setStatColor(1, stat, '#ff3b3b');
            setStatColor(2, stat, '#39ff14');
        } else {
            setStatColor(1, stat, 'inherit');
            setStatColor(2, stat, 'inherit');
        }
    });
}
function setStatColor(cardIdx, stat, color) {
    document.querySelector(`.card-holder:nth-child(${cardIdx}) .monster-${stat}`).style.color = color;
}

// Comparison graphs in right column
function drawComparisonGraphs() {
    if (!selectedMonsters[0] || !selectedMonsters[1]) return;
    const leftStats = getStatGrowthArrays(selectedMonsters[0]);
    const rightStats = getStatGrowthArrays(selectedMonsters[1]);
    const statTypes = ['hp', 'ap', 'atk', 'def'];
    statTypes.forEach(stat => {
        const ctx = document.getElementById(`${stat}-comparison-graph`).getContext('2d');
        if (window[`${stat}Chart`]) window[`${stat}Chart`].destroy();
        window[`${stat}Chart`] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 99}, (_, i) => i + 1),
                datasets: [
                    { label: selectedMonsters[0].monsterName, data: leftStats[stat + 'Arr'], borderColor: '#00eaff', backgroundColor: 'rgba(0,234,255,0.1)', tension: 0.2 },
                    { label: selectedMonsters[1].monsterName, data: rightStats[stat + 'Arr'], borderColor: '#ff6384', backgroundColor: 'rgba(255,99,132,0.1)', tension: 0.2 }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#fff',
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Level', color: '#fff', font: { size: 16, weight: 'bold' } },
                        ticks: { color: '#fff', font: { size: 14, weight: 'bold' } }
                    },
                    y: {
                        title: { display: true, text: `Stat Value ${stat.toUpperCase()}`, color: '#fff', font: { size: 16, weight: 'bold' } },
                        ticks: { color: '#fff', font: { size: 14, weight: 'bold' } }
                    }
                }
            }
        });
    });
}

// Helper to get stat arrays for a monster
function getStatGrowthArrays(monster) {
    const maxLevel = 99;
    let hpArr = [], atkArr = [], defArr = [], apArr = [];
    let baseHp = monster.hp, baseAtk = monster.atk, baseDef = monster.def, baseAp = monster.ap;
    let gt = monster.gt;
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
        let hp = baseHp + hpCalc(gt, lvl);
        let atk = baseAtk + atkDefCalc(gt, lvl);
        let def = baseDef + atkDefCalc(gt, lvl);
        let ap = baseAp + apCalc(gt, lvl);
        hpArr.push(Math.ceil(hp));
        atkArr.push(atk);
        defArr.push(def);
        apArr.push(ap);
    }
    return { hpArr, atkArr, defArr, apArr };
}



// sets up card holders since we use classes
document.querySelectorAll('.card-holder').forEach(setupMonsterCard);