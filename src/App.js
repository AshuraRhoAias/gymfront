import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Inscripciones from './Components/Header/Inscripciones';
import Renovaciones from './Components/Header/Renovaciones';
import DashboardHome from './Components/DashboardHome';
import Cuenta from './Components/Header/Cuenta';
import CajaHistorial from './Components/Header/CajaHistorial';

function App() {
  const Url = "192.168.100.55:5000";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login url={Url} />} />
        <Route path="/dashboard" element={<Dashboard  url={Url}/>}>
          <Route index element={<DashboardHome url={Url} />} />
          <Route path="inscripciones" element={<Inscripciones url={Url} />} />
          <Route path="renovaciones" element={<Renovaciones url={Url} />} />
          <Route path="cuenta" element={<Cuenta url={Url} />} />
          <Route path="caja" element={<CajaHistorial url={Url} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
