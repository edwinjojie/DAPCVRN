import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import { Briefcase, XCircle } from 'lucide-react';

console.log('App starting...');

function RouteLogger() {
  const location = useLocation();
  console.log('Current Location:', location.pathname);
  return null;
}

function App() {
  console.log('App rendering...');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteLogger />
      <Routes>
        <Route path="/:id" element={<PortfolioPage />} />
        {/* Redirect root to a simple landing or error if no ID is provided */}
        <Route path="/" element={<div className="flex min-h-screen items-center justify-center p-4 text-center bg-slate-50">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mx-auto shadow-xl ring-4 ring-blue-50">
               <Briefcase className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Professional Portfolio</h1>
            <p className="text-slate-500 text-lg">Please scan a digital card to view the candidate's verified profile.</p>
          </div>
        </div>} />
        {/* Catch-all for debugging */}
        <Route path="*" element={
          <div className="flex min-h-screen items-center justify-center p-4 text-center bg-slate-50">
            <div className="max-w-md space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto shadow-xl ring-4 ring-red-50">
                 <XCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Portfolio Not Found</h1>
              <p className="text-slate-500">No matching portfolio found. Please check the link or scan a valid card.</p>
              <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Go Home</button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;