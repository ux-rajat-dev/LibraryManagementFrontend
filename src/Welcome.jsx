import React from 'react';

const DashboardWelcome = () => {
  const user = localStorage.getItem('user');
  return (
    <div className="p-6">
      <h2 className="text-3xl font-heading font-semibold mb-4">Welcome 👋</h2>
      <p className="font-body text-gray-700">
        Select a section from the left sidebar to get started.
      </p>
    </div>
  );
};

export default DashboardWelcome;
