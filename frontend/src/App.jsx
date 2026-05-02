import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePorra from './pages/CreatePorra';
import MyPorras from './pages/MyPorras';
import PorraDetail from './pages/PorraDetail';
import OracleMock from './pages/OracleMock';
import Storytelling from './pages/Storytelling';
import Smartcontracts from './pages/Smartcontracts';
import BuddyBetsMVP from './pages/BuddyBetsMVP';
import BuddyBetsPorraFlow from './pages/BuddyBetsPorraFlow';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePorra />} />
        <Route path="/my-porras" element={<MyPorras />} />
        <Route path="/oracle-mock" element={<OracleMock />} />
        <Route path="/buddybettsmvp" element={<BuddyBetsMVP />} />
        <Route path="/buddybettsmvp/flujo-porra" element={<BuddyBetsPorraFlow />} />
        <Route path="/storytelling" element={<Storytelling />} />
        <Route path="/smartcontracts" element={<Smartcontracts />} />
        <Route path="/porra/:gameAddress" element={<PorraDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
