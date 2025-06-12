import React from 'react';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { SearchBar } from '../Explore/SearchBar';

const UserOverview = () => {
  return (
    <DashboardPageWrapper header={<SearchBar isLocationEnabled />}>
      <div>Your overview goes here</div>
    </DashboardPageWrapper>
  );
};

export default UserOverview;
