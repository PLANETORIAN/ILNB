import React from 'react';
import QuickActions from '../components/dashboard/QuickActions';
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics';
import AllInvestmentsView from '../components/dashboard/AllInvestmentsView';
import PortfolioPerformance from '../components/dashboard/PortfolioPerformance';
import AddInvestmentForm from '../components/dashboard/AddInvestmentForm';
import PortfolioRecommendations from '../components/dashboard/PortfolioRecommendations';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="dashboard-component glass-effect rounded-xl p-4">
        <AddInvestmentForm />
      </div>

      <PortfolioPerformance />
      
      <div className="dashboard-component glass-effect rounded-xl p-4">
        <AllInvestmentsView />
      </div>

      <div className="dashboard-component glass-effect rounded-xl p-4">
        <PortfolioRecommendations />
      </div>

      <div className="dashboard-component glass-effect rounded-xl p-4">
        <PerformanceMetrics />
      </div>

      <div className="dashboard-component glass-effect rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;