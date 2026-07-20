import { Route, Routes } from 'react-router-dom'
import ThemeSelectPage from './pages/ThemeSelectPage'
import BuilderPage from './pages/BuilderPage'
import AuthButton from './components/AuthButton'
import AuthModal from './components/AuthModal'

export default function App() { return <><AuthButton /><AuthModal /><Routes><Route path="/" element={<ThemeSelectPage />} /><Route path="/build" element={<BuilderPage />} /><Route path="*" element={<ThemeSelectPage />} /></Routes></> }
