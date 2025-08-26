import { useState, useEffect, useRef } from 'react';
import '../styles.css';
import { Monsters } from '../assets/monsters';
import { calc } from '../utils/lvl_calc';
import { marked } from 'marked';
import { SendHorizontal } from 'lucide-react';



// displays null/useless values in the DB as "-"
function displayValue(val) {
  if (val === -1 || val === "No Effect") return "-";
  return val;
}


// sets up the monster card after it is searched in the search bar
function MonsterCard({ monster, level, onLevelChange }) {
  if (!monster) return null;
  const [stats, setStats] = useState(calc(monster, level));

  // calls lvl_calc.js's exported function to update stats as the level changes
  useEffect(() => {
    setStats(calc(monster, level));
  }, [monster, level]);

  // returns the monster card and all associated elements for viewer to use
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
              onLevelChange(null); // allow clearing the field
            } else {
              const num = Number(val);
              if (!isNaN(num) && num >= 1 && num <= 99) {
                onLevelChange(num); // only runs if within range
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
        <div className="monster-field"><span>HP:</span> <span>{displayValue(stats[0])}</span></div>
        <div className="monster-field"><span>AP:</span> <span>{displayValue(stats[3])}</span></div>
        <div className="monster-field"><span>ATK:</span> <span>{displayValue(stats[1])}</span></div>
        <div className="monster-field"><span>DEF:</span> <span>{displayValue(stats[2])}</span></div>
        <div className="monster-field"><span>Luck:</span> <span>{displayValue(monster.luck)}</span></div>
        <div className="monster-field"><span>Speed:</span> <span>{displayValue(monster.speed)}</span></div>
      </div>
      <div className="monster-field"><span>Battle Arts Effect:</span> <span>{displayValue(monster.attackEffect)} ({displayValue(monster.attackEffectUnlockLvl)})</span></div>
      <div className="monster-field"><span>Special Name:</span> <span>{displayValue(monster.specialName)}</span></div>
      <div className="monster-field"><span>Special Description:</span> <span>{displayValue(monster.specialEffect)}</span></div>
      <div className="monster-field"><span>Ability 1:</span> <span>{displayValue(monster.ability1)} ({displayValue(monster.ability1UnlockLvl)})</span></div>
      <div className="monster-field"><span>Ability 2:</span> <span>{displayValue(monster.ability2)} ({displayValue(monster.ability2UnlockLvl)})</span></div>
      <div className="monster-field"><span>Ability 3:</span> <span>{displayValue(monster.ability3)} ({displayValue(monster.ability3UnlockLvl)})</span></div>
    </div> // ^^^^^^^^^^^^ builds out the monster stats on the card from the hardcoded DB
  ); 
}


// AI chat section
function ChatSection() {

  // setting up useState and Variables of the chat
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Welcome to FBKaizo AI! I'm your Yu-Gi-Oh! The Falsebound Kingdom assistant. Ask me about any monster's stats, skills, or strategic information." }
  ]);
  const [input, setInput] = useState('');
  const chatWindowRef = useRef(null);


  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);



  // this handles the sending and receiving of messages in the chatbox
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;



    // updates messages array useState when the user sends a message
    setMessages(msgs => [...msgs, { sender: 'user', text: input }]);
    setInput('');
    setMessages(msgs => [...msgs, { sender: 'bot', text: 'Thinking...' }]);



    // sends the user message to the AI for processing
    try {
      const response = await fetch('http://localhost:3000/api/ai-output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      const data = await response.json();



      // Remove "Thinking..." message and returns the AI response in its place
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



  // this builds out the chat box and the input field for the user below the messages sent and received
  return (
    //this div builds a scrollable (chatWindowRef) window for the chat
    //.map iterates over the messages array and sorts them in the box based on the key (user or bot)
    //dangerouslySetInnerHTML inserts HTML generated by marked(msg.text) to convert markdown to HTML
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
        <button type="submit"><span className="send"><SendHorizontal color="#000000" stroke-width={1.4} size={18} fill="black"/></span></button>
      </form>
    </section> // ^^^^^^^^^^^^ user's chat section to call setInput useState and sendMessage function
  );
}



// builds out HomePage component for export to App.jsx
export default function HomePage() {
  // set up useState variables for component
  const [search, setSearch] = useState('');
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [level, setLevel] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter monsters for dropdown
  const filteredMonsters = Monsters.filter(m => m.monsterName.toLowerCase().includes(search.toLowerCase()));

  // webpage content
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