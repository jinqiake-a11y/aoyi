import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ThreeBackground from './components/ThreeBackground';
import Layout from './components/Layout';
import Home from './pages/Home';
import SkillDetail from './pages/SkillDetail';
import LibraryPage from './pages/Library';
import SettingsPage from './pages/Settings';
import AboutPage from './pages/About';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl font-bold gradient-text mb-4" style={{ fontFamily: 'var(--font-display)' }}>404</div>
      <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>页面未找到</p>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>你访问的页面不存在</p>
      <Link to="/" className="neon-btn px-6 py-2.5 rounded-xl text-sm">返回首页</Link>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ThreeBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/skill/:id" element={<SkillDetail />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
