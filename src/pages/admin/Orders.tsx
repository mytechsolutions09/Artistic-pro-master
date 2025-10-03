import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import OrderManagement from '../../components/admin/OrderManagement';

const Orders: React.FC = () => {
  return (
    <AdminLayout title="Orders" noHeader={true}>
      <div className="p-6">
        <OrderManagement />
      </div>
    </AdminLayout>
  );
};

export default Orders;
