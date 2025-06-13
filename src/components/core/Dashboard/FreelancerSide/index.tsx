import { DashboardPageWrapper } from '../DashboardPageWrapper';
import Charts from './Home/Charts';
import Stats from './Home/Stats';
import TodayAppointments from './Home/TodayAppointments';

const FreelancerHome = () => {
  return (
    <DashboardPageWrapper header={<h2 className="text-2xl font-semibold">Platform Overview</h2>}>
      <Stats />
      <Charts />
      <TodayAppointments />
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
