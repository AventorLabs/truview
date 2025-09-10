import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Dashboard from './pages/Dashboard';
import ARPreview from './pages/ARPreview';
import BrowseProducts from './pages/BrowseProducts';
import ClientFeedback from './pages/ClientFeedback';
import ARClientPreview from './pages/ARClientPreview';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public route for client AR preview */}
          <Route path="/ar-client-preview" element={<ARClientPreview />} />
          
          {/* Protected admin routes */}
          <Route path="/*" element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/preview/:id" element={<ARPreview />} />
                  <Route path="/browse" element={<BrowseProducts />} />
                  <Route path="/feedback" element={<ClientFeedback />} />
                </Routes>
              </Layout>
            </AuthGuard>
          } />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;