import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Inscripciones from './Components/Header/Inscripciones';
import Renovaciones from './Components/Header/Renovaciones';
import InscripcionesBacho from './Components/Header/InscripcionesBacho';
import RenovacionesBacho from './Components/Header/RenovacionesBacho';
import DashboardHome from './Components/DashboardHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome  />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="renovaciones" element={<Renovaciones />} />
          <Route path="inscripciones-bacho" element={<InscripcionesBacho />} />
          <Route path="renovaciones-bacho" element={<RenovacionesBacho />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
