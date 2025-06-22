import React from 'react';

import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { SearchBar } from '../../SearchBar';
import { ExpertList } from './ExpertSection';
import { SectionHeader } from './SectionHeader';
import { ViewMoreButton } from './ViewMoreButton';

const dummyExperts: Expert[] = [
  {
    id: '1',
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  {
    id: '4',
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  {
    id: '6',
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
