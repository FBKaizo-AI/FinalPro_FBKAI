import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import { Monsters } from '../assets/monsters';
import { calc } from '../utils/lvl_calc';
import { marked } from 'marked';

function MonsterCard({ monster, level, onLevelChange }) {
  if (!monster) return null;
  const [stats, setStats] = useState(calc(monster, level));

  useEffect(() => {
    setStats(calc(monster, level));
  }, [monster, level]);

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
              onLevelChange(null); // Allow clearing the field
            } else {
              const num = Number(val);
              if (!isNaN(num) && num >= 1 && num <= 99) {
                onLevelChange(num); // Only set if within range
              }
            }
          }}
          className="level-input"
        />
      </div>
      <h2>{monster.monsterName}</h2>
      <div className="monster-fields-grid">
        <div className="monster-field"><span>Class:</span> <span>{monster.class}</span></div>
        <div className="monster-field"><span>GT:</span> <span>{monster.gt}</span></div>
        <div className="monster-field"><span>HP:</span> <span>{stats[0]}</span></div>
        <div className="monster-field"><span>AP:</span> <span>{stats[3]}</span></div>
        <div className="monster-field"><span>ATK:</span> <span>{stats[1]}</span></div>
        <div className="monster-field"><span>DEF:</span> <span>{stats[2]}</span></div>
        <div className="monster-field"><span>Luck:</span> <span>{monster.luck}</span></div>
        <div className="monster-field"><span>Speed:</span> <span>{monster.speed}</span></div>
      </div>
      <div className="monster-field"><span>Battle Arts Effect:</span> <span>{monster.attackEffect} ({monster.attackEffectUnlockLvl})</span></div>
      <div className="monster-field"><span>Special Name:</span> <span>{monster.specialName}</span></div>
      <div className="monster-field"><span>Special Description:</span> <span>{monster.specialEffect}</span></div>
      <div className="monster-field"><span>Ability 1:</span> <span>{monster.ability1} ({monster.ability1UnlockLvl})</span></div>
      <div className="monster-field"><span>Ability 2:</span> <span>{monster.ability2} ({monster.ability2UnlockLvl})</span></div>
      <div className="monster-field"><span>Ability 3:</span> <span>{monster.ability3} ({monster.ability3UnlockLvl})</span></div>
    </div>
  );
}

function ChatSection() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Welcome to FBKaizo AI! I'm your Yu-Gi-Oh! The Falsebound Kingdom assistant. Ask me about any monster's stats, skills, or strategic information." }
  ]);
  const [input, setInput] = useState('');
  const chatWindowRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(msgs => [...msgs, { sender: 'user', text: input }]);
    setInput('');
    setMessages(msgs => [...msgs, { sender: 'bot', text: 'Thinking...' }]);

    try {
      const response = await fetch('http://localhost:3000/api/ai-output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      const data = await response.json();

      // Remove "Thinking..." message
      setMessages(msgs => msgs.filter(m => m.text !== 'Thinking...'));

      if (response.ok) {
        setMessages(msgs => [...msgs, { sender: 'bot', text: data.answer }]);
      } else {
        setMessages(msgs => [...msgs, { sender: 'bot', text: `Error: ${data.error || 'Failed to get AI response'}` }]);
      }
    } catch (error) {
      setMessages(msgs => msgs.filter(m => m.text !== 'Thinking...'));
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Error connecting to the server.' }]);
    }
  };

  return (
    <section className="chat-section">
      <div ref={chatWindowRef} className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            {msg.sender === 'bot' ? (
              <div
                className={`message-bubble ${msg.sender}`}
                dangerouslySetInnerHTML={{ __html: marked(msg.text) }}
              />
            ) : (
              <div className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about monster stats, skills, or strategies..."
          autoComplete="off"
        />
        <button type="submit">&#9658;</button>
      </form>
    </section>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [level, setLevel] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter monsters for dropdown
  const filteredMonsters = Monsters.filter(m => m.monsterName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <header className="header-bar">
        <div className="header-left">
          <a href="/" className="logo">FBKaizo AI</a>
        </div>
        <nav className="header-right">
          <a href="/">Homepage</a>
          <a href="/Compare">Compare</a>
        </nav>
      </header>
      <main className="main-content">
        <aside className="monster-sidebar">
          <div className="monster-search">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setIsDropdownOpen(false)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setIsDropdownOpen(false);
                  const match = Monsters.find(m => m.monsterName.toLowerCase() === e.target.value.toLowerCase());
                if (match) {
                  setSelectedMonster(match);
                  setLevel(1);
                }
              }}}
              placeholder="Search monsters..."
              autoComplete="off"
            />
            <ul className={`monster-dropdown dropdown-list${isDropdownOpen && filteredMonsters.length > 0 ? ' show' : ''}`}>
              {filteredMonsters.map(monster => (
                <li key={monster.monsterName} onMouseDown={() => {
                  setSelectedMonster(monster);
                  setSearch(monster.monsterName);
                  setLevel(1);
                  setIsDropdownOpen(false);
                }}>
                  {monster.monsterName}
                </li>
              ))}
            </ul>
          </div>
          {selectedMonster && (
            <MonsterCard
              monster={selectedMonster}
              level={level}
              onLevelChange={setLevel}
            />
          )}
        </aside>
        <ChatSection />
      </main>
    </div>
  );
}