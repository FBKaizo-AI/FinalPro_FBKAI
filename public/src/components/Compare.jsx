import { useState, useRef, useEffect } from 'react';
import '../styles.css';
import { Monsters } from '../assets/monsters';
import { calc, hpCalc, atkDefCalc, apCalc } from '../utils/lvl_calc';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend } from 'chart.js';
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend);

// get stat array for a monster
function getStatGrowthArrays(monster) {
  // setting up variables/arrays for stats
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

// displays null/useless values in the DB as "-"
function displayValue(val) {
  if (val === -1 || val === "No Effect") return "-";
  return val;
}


// sets up comparison specific monster cards
function MonsterCard({ monster, level, onLevelChange, statCompare }) {

  //establish useState and useEffect for changes
  if (!monster) return null;
  const [stats, setStats] = useState(calc(monster, level));
  useEffect(() => {
    setStats(calc(monster, level));
  }, [monster, level]);


  //sets colors for the higher and lower numbers of a stat for both cards
  function getStatColor(statName) {
    if (!statCompare) return {};
    if (statCompare[statName] === 'high') return { color: '#39ff14', fontWeight: 'bold' };
    if (statCompare[statName] === 'low') return { color: '#ff3b3b', fontWeight: 'bold' };
    return { color: 'inherit', fontWeight: 'normal' };
  }


  //building the card itself, returns elements for user viewing
  return (
    <div className="monster-card">
      <img className="monster-portrait" src={monster.portrait} alt={`${monster.monsterName} portrait`} />

      <div className="level-calc-container">
        <label htmlFor="level-input" className="level-label">Level:</label>

        <input
          type="number"
          min={1}
          max={99}
          value={level === null ? '' : level}
          onChange={e => {
            const val = e.target.value;
            if (val === '') {
              onLevelChange(null); // allows for field clearing
            } else {
              const num = Number(val);
              if (!isNaN(num) && num >= 1 && num <= 99) {
                onLevelChange(num); // only runs within range
              }
            }
          }}
          className="level-input"
        />
      </div>


      <h2>{monster.monsterName}</h2>
      <div className="monster-fields-grid">
        <div className="monster-field"><span>Class:</span> <span>{displayValue(monster.class)}</span></div>
        <div className="monster-field"><span>GT:</span> <span>{displayValue(monster.gt)}</span></div>
        <div className="monster-field"><span>HP:</span> <span style={getStatColor('hp')}>{displayValue(stats[0])}</span></div>
        <div className="monster-field"><span>AP:</span> <span style={getStatColor('ap')}>{displayValue(stats[3])}</span></div>
        <div className="monster-field"><span>ATK:</span> <span style={getStatColor('atk')}>{displayValue(stats[1])}</span></div>
        <div className="monster-field"><span>DEF:</span> <span style={getStatColor('def')}>{displayValue(stats[2])}</span></div>
        <div className="monster-field"><span>Luck:</span> <span>{displayValue(monster.luck)}</span></div>
        <div className="monster-field"><span>Speed:</span> <span>{displayValue(monster.speed)}</span></div>
      </div>
      <div className="monster-field"><span>Battle Arts Effect:</span> <span>{displayValue(monster.attackEffect)} ({displayValue(monster.attackEffectUnlockLvl)})</span></div>
      <div className="monster-field"><span>Special Name:</span> <span>{displayValue(monster.specialName)}</span></div>
      <div className="monster-field"><span>Special Description:</span> <span>{displayValue(monster.specialEffect)}</span></div>
      <div className="monster-field"><span>Ability 1:</span> <span>{displayValue(monster.ability1)} ({displayValue(monster.ability1UnlockLvl)})</span></div>
      <div className="monster-field"><span>Ability 2:</span> <span>{displayValue(monster.ability2)} ({displayValue(monster.ability2UnlockLvl)})</span></div>
      <div className="monster-field"><span>Ability 3:</span> <span>{displayValue(monster.ability3)} ({displayValue(monster.ability3UnlockLvl)})</span></div>
    </div> // ^^^^^^^^^^^^ builds out the monster stats on the card from the hardcoded DB, plus stat colors for this one
  );
}



//building individual monster graphs for stat scaling per level
function StatGraph({ monster, idx }) {
  const chartRef = useRef(null);

  //builds and renders individual stat graph in canvas element when monster is selected
  //ctx takes chartRef variable above to reference canvas element with useRef(). The canvas element is where the chart will render
  //getStatGrowthArrays gets your 1-99 iterations for stat values
  //ctx gets the current context of the canvas element, which you need to render the chart
  //chart variable makes a new Chart.js with the ctx variable's context. Chart is stored in chart variable.
  
  useEffect(() => {
    if (!monster) return;
    const { hpArr, atkArr, defArr } = getStatGrowthArrays(monster);
    const ctx = chartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        //labels creates a new array with a length of 99. "_" is the unused value, which is the array element itself and not needed here. "i" is the iteration.
        labels: Array.from({ length: 99 }, (_, i) => i + 1),
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
            type: 'linear',
            title: { display: true, text: 'Level', color: '#fff', font: { size: 16, weight: 'bold' } },
            ticks: { color: '#fff', font: { size: 14, weight: 'bold' } }
          },
          y: {
            title: { display: true, text: `Stat Value (${monster.monsterName})`, color: '#fff', font: { size: 16, weight: 'bold' } },
            ticks: { color: '#fff', font: { size: 14, weight: 'bold' } }
          }
        }
      }
    });
    return () => chart.destroy(); // removes chart and its listeners when it's time to bring a new one in (selecting new monster)
  }, [monster]);

  //renders chart
  return <canvas ref={chartRef} width={400} height={200}></canvas>;
}



//builds and renders 4 graphs for comparing stats between two selected monsters from levels 1-99
//requires both monsters to be selected but follows same rules as graphs above
function ComparisonGraph({ monsters, stat, id }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!monsters[0] || !monsters[1]) return;
    const leftStats = getStatGrowthArrays(monsters[0]);
    const rightStats = getStatGrowthArrays(monsters[1]);
    const ctx = chartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 99 }, (_, i) => i + 1),
        datasets: [
          { label: monsters[0].monsterName, data: leftStats[stat + 'Arr'], borderColor: '#00eaff', backgroundColor: 'rgba(0,234,255,0.1)', tension: 0.2 },
          { label: monsters[1].monsterName, data: rightStats[stat + 'Arr'], borderColor: '#ff6384', backgroundColor: 'rgba(255,99,132,0.1)', tension: 0.2 }
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
            type: 'linear',
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
    return () => chart.destroy();
  }, [monsters, stat]);

  return <canvas ref={chartRef} width={480} height={110}></canvas>;
}


// prepares Compare webpage for export to use in App.jsx
export default function Compare() {
  // set up useState variables for component
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [selectedMonsters, setSelectedMonsters] = useState([null, null]);
  const [levels, setLevels] = useState([null, null]);
  const [isDropdownOpen, setIsDropdownOpen] = useState([false, false]);
  const filteredMonsters1 = Monsters.filter(m => m.monsterName.toLowerCase().includes(search1.toLowerCase()));
  const filteredMonsters2 = Monsters.filter(m => m.monsterName.toLowerCase().includes(search2.toLowerCase()));

  // Stat comparison logic
  function getStatCompare(idx) {
    //setting up comparison variables
    const otherIdx = idx === 0 ? 1 : 0; // determines index of other monster (if idx===0, otherIdx===1 and vice versa)
    const m1 = selectedMonsters[idx];
    const m2 = selectedMonsters[otherIdx];
    const l1 = levels[idx] ?? 1; // level defaults to 1 if not set
    const l2 = levels[otherIdx] ?? 1;
    if (!m1 || !m2) return null; // requires both monsters be selected to continue
    const s1 = calc(m1, l1); // calculates monster stats at their assigned level
    const s2 = calc(m2, l2);
    return {
      hp: s1[0] > s2[0] ? 'high' : s1[0] < s2[0] ? 'low' : 'equal',
      ap: s1[3] > s2[3] ? 'high' : s1[3] < s2[3] ? 'low' : 'equal',
      atk: s1[1] > s2[1] ? 'high' : s1[1] < s2[1] ? 'low' : 'equal',
      def: s1[2] > s2[2] ? 'high' : s1[2] < s2[2] ? 'low' : 'equal',
    }; // ^^^^ determines which stats are higher or lower to assign colors
  }


  //webpage content
  return (
    <div>
      <header className="header-bar">
        <div className="header-left">
          <a href="/" className="logo">FBK<span className="ai-logo">AI</span>ZO</a>
        </div>
        <nav className="header-right">
          <a href="/">Homepage</a>
          <a href="/Compare">Compare</a>
        </nav>
      </header>
      <main className="main-content compare-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', width: '100vw', marginTop: '56px' }}>
        <div className="cards-row" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '0px' }}>
          <div className="card-holder">
            <div className="monster-search">
              <input
                type="text"
                value={search1}
                onChange={e => {
                  setSearch1(e.target.value);
                  setIsDropdownOpen([true, isDropdownOpen[1]]);
                }}
                onFocus={() => setIsDropdownOpen([true, isDropdownOpen[1]])}
                onBlur={() => setTimeout(() => setIsDropdownOpen([false, isDropdownOpen[1]]), 120)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    setIsDropdownOpen([false, isDropdownOpen[1]]);
                    const match = Monsters.find(m => m.monsterName.toLowerCase() === e.target.value.toLowerCase());
                    if (match) {
                      setSelectedMonsters([match, selectedMonsters[1]]);
                      setLevels([1, levels[1]]);
                      setSearch1(match.monsterName);
                    }
                  }
                }}
                placeholder="Search monster 1..."
                autoComplete="off"
              />
              <ul className={`monster-dropdown dropdown-list${isDropdownOpen[0] && filteredMonsters1.length > 0 ? ' show' : ''}`}> 
                {filteredMonsters1.map(monster => {
                  return <li key={monster.monsterName} onMouseDown={() => {
                    setSelectedMonsters([monster, selectedMonsters[1]]);
                    setSearch1(monster.monsterName);
                    setLevels([1, levels[1]]);
                    setIsDropdownOpen([false, isDropdownOpen[1]]);
                  }}>{monster.monsterName}</li>;
                })}
              </ul>
            </div>
            <MonsterCard
              monster={selectedMonsters[0]}
              level={levels[0]}
              onLevelChange={lvl => setLevels([lvl, levels[1]])}
              statCompare={getStatCompare(0)}
            />
          </div>
          <div className="card-holder">
            <div className="monster-search">
              <input
                type="text"
                value={search2}
                onChange={e => {
                  setSearch2(e.target.value);
                  setIsDropdownOpen([isDropdownOpen[0], true]);
                }}
                onFocus={() => setIsDropdownOpen([isDropdownOpen[0], true])}
                onBlur={() => setTimeout(() => setIsDropdownOpen([isDropdownOpen[0], false]), 120)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    setIsDropdownOpen([isDropdownOpen[0], false]);
                    const match = Monsters.find(m => m.monsterName.toLowerCase() === e.target.value.toLowerCase());
                    if (match) {
                      setSelectedMonsters([selectedMonsters[0], match]);
                      setLevels([levels[0], 1]);
                      setSearch2(match.monsterName);
                    }
                  }
                }}
                placeholder="Search monster 2..."
                autoComplete="off"
              />
              <ul className={`monster-dropdown dropdown-list${isDropdownOpen[1] && filteredMonsters2.length > 0 ? ' show' : ''}`}> 
                {filteredMonsters2.map(monster => {
                  return <li key={monster.monsterName} onMouseDown={() => {
                    setSelectedMonsters([selectedMonsters[0], monster]);
                    setSearch2(monster.monsterName);
                    setLevels([levels[0], 1]);
                    setIsDropdownOpen([isDropdownOpen[0], false]);
                  }}>{monster.monsterName}</li>;
                })}
              </ul>
            </div>
            <MonsterCard
              monster={selectedMonsters[1]}
              level={levels[1]}
              onLevelChange={lvl => setLevels([levels[0], lvl])}
              statCompare={getStatCompare(1)}
            />
          </div>
        </div>
        {/* Individual stat graphs row below cards */}
        <div className="individual-graphs-row" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '32px', margin: '32px 0 0 0' }}>
          <div style={{ width: '500px', display: 'flex', justifyContent: 'center' }}>
            <StatGraph monster={selectedMonsters[0]} idx={0} />
          </div>
          <div style={{ width: '500px', display: 'flex', justifyContent: 'center' }}>
            <StatGraph monster={selectedMonsters[1]} idx={1} />
          </div>
        </div>
        {/* Comparison graphs section, always below individual graphs */}
        <div style={{ width: '100%', marginTop: '48px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}></div>
          <div className="comparison-graphs-grid" style={{ width: '900px', marginRight: '180px' }}>
            <ComparisonGraph monsters={selectedMonsters} stat="hp" id="hp-comparison-graph" />
            <ComparisonGraph monsters={selectedMonsters} stat="ap" id="ap-comparison-graph" />
            <ComparisonGraph monsters={selectedMonsters} stat="atk" id="atk-comparison-graph" />
            <ComparisonGraph monsters={selectedMonsters} stat="def" id="def-comparison-graph" />
          </div>
        </div>
      </main>
    </div>
  );
}