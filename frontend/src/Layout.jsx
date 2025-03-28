import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (  // Add the return statement here
    <div className="flex m-2 bg-gray-200 flex-col max-w-6xl mx-auto">
      <main className="flex-1 bg-white flex flex-col  p-4">
        <div className="flex-grow h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
