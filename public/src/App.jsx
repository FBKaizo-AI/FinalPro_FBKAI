import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Compare from './components/Compare';
import './styles.css'

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Compare" element={<Compare />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
