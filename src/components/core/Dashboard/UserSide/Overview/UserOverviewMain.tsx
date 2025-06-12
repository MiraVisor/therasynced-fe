import React from 'react';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { SearchBar } from '../../SearchBar';
import { Expert, ExpertList } from './ExpertSection';
import { SectionHeader } from './SectionHeader';
import { ViewMoreButton } from './ViewMoreButton';

const dummyExperts: Expert[] = [
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: false,
  },
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: false,
  },
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: false,
  },
];

const UserOverview = () => {
  return (
    <DashboardPageWrapper header={<SearchBar isLocationEnabled />}>
      <SectionHeader />
      <ExpertList experts={dummyExperts} />
      <ViewMoreButton />
    </DashboardPageWrapper>
  );
};

export default UserOverview;
