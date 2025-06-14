import { DashboardPageWrapper } from '../DashboardPageWrapper';
import Charts from './Home/Charts';
import Stats from './Home/Stats';
import TodayAppointments from './Home/TodayAppointments';

const FreelancerHome = () => {
  return (
    <DashboardPageWrapper
      header={<h2 className="text-xl lg:text-2xl font-semibold">Platform Overview</h2>}
    >
      <div className="flex flex-col gap-4 lg:gap-12">
        <Stats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          <Charts />
          <TodayAppointments />
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
