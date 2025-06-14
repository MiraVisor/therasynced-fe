import { DashboardPageWrapper } from '../DashboardPageWrapper';
import Charts from './Home/Charts';
import Stats from './Home/Stats';
import TodayAppointments from './Home/TodayAppointments';

const FreelancerHome = () => {
  return (
    <DashboardPageWrapper header={<h2 className="text-2xl font-semibold">Platform Overview</h2>}>
      <div className="flex flex-col gap-4 md:gap-16">
        <Stats />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-16">
          <Charts />
          <TodayAppointments />
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
