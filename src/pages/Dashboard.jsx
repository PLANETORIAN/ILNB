import React from 'react';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import InvestmentList from '../components/dashboard/InvestmentList';
import PlatformBreakdown from '../components/dashboard/PlatformBreakdown';
import QuickActions from '../components/dashboard/QuickActions';
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics';
import InvestmentComparison from '../components/dashboard/InvestmentComparison';
import AllInvestmentsView from '../components/dashboard/AllInvestmentsView';
import AssetChartGrid from '../components/dashboard/AssetChartGrid';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="dashboard-component glass-effect rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
        <PortfolioSummary />
      </div>

      <div className="dashboard-component glass-effect rounded-xl p-4">
        <AssetChartGrid />
      </div>

      <div className="dashboard-component glass-effect rounded-xl p-4">
        <AllInvestmentsView />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="dashboard-component glass-effect rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Investments</h2>
            <InvestmentList />
          </div>
        </div>
        <div>
          <div className="dashboard-component glass-effect rounded-xl p-4 h-full">
            <PlatformBreakdown />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-component glass-effect rounded-xl p-4">
          <PerformanceMetrics />
        </div>
        <div className="dashboard-component glass-effect rounded-xl p-4">
          <InvestmentComparison />
        </div>
      </div>

      <div className="dashboard-component glass-effect rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;