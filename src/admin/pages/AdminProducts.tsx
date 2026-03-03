import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminProductCreate from './AdminProductCreate';
import AdminProductEdit from './AdminProductEdit';
import AdminProductsList from './AdminProductsList';

export default function AdminProducts(): React.ReactElement {
  return (
    <Routes>
      <Route index element={<AdminProductsList />} />
      <Route path="new" element={<AdminProductCreate />} />
      <Route path="edit/:id" element={<AdminProductEdit />} />
    </Routes>
  );
}

