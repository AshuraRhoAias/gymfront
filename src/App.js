import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Inscripciones from './Components/Header/Inscripciones';
import Renovaciones from './Components/Header/Renovaciones';
import DashboardHome from './Components/DashboardHome';
import Cuenta from './Components/Header/Cuenta';
import CajaHistorial from './Components/Header/CajaHistorial';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome  />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="renovaciones" element={<Renovaciones />} />
          <Route path="cuenta" element={<Cuenta />} />
          <Route path="caja" element={<CajaHistorial />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
