import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import BundlesIndex from './pages/BundlesIndex';
import CreateBundle from './pages/CreateBundle';
import EditBundle from './pages/EditBundle';

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/bundles" replace />} />
          <Route path="/bundles" element={<BundlesIndex />} />
          <Route path="/bundles/new" element={<CreateBundle />} />
          <Route path="/bundles/:id/edit" element={<EditBundle />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
