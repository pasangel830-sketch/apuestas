import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePorra from './pages/CreatePorra';
import MyPorras from './pages/MyPorras';
import PorraDetail from './pages/PorraDetail';
import OracleMock from './pages/OracleMock';
import Storytelling from './pages/Storytelling';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePorra />} />
        <Route path="/my-porras" element={<MyPorras />} />
        <Route path="/oracle-mock" element={<OracleMock />} />
        <Route path="/storytelling" element={<Storytelling />} />
        <Route path="/porra/:gameAddress" element={<PorraDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
