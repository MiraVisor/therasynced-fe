import Image from 'next/image';

import { FreelancerStatCardType } from '@/types/types';

const CardsData: FreelancerStatCardType[] = [
  {
    id: 1,
    title: 'Weekly Appointments',
    number: 40,
    icon: (
      <Image
        src={'../freelancers/weekly_appointments.svg'}
        alt="weekly apooinments icon"
        width={60}
        height={60}
      />
    ),
    percentage: 'up',
    percentageNumber: 8.5,
  },
  {
    id: 2,
    title: 'Client Satisfaction',
    number: 10,
    icon: (
      <Image
        src={'../freelancers/client_satisfaction.svg'}
        alt="client satisfaction icon"
        width={60}
        height={60}
      />
    ),
    percentage: 'up',
    percentageNumber: 1.3,
  },
  {
    id: 3,
    title: 'Active Clients',
    number: 4,
    icon: (
      <Image src={'../freelancers/new_clients.svg'} alt="new clients icon" width={60} height={60} />
    ),
    percentage: 'down',
    percentageNumber: 4.3,
  },
  {
    id: 4,
    title: 'Revenue',
    number: 13400,
    icon: <Image src={'../freelancers/revenue.svg'} alt="revenue icon" width={60} height={60} />,
    percentage: 'up',
    percentageNumber: 1.8,
  },
];

const Stats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-16">
      {CardsData.map((data) => {
        return (
          <div
            key={data.id}
            className="bg-white rounded-xl md:rounded-2xl border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-3px_rgba(0,0,0,0.1),0_12px_24px_-2px_rgba(0,0,0,0.06)] transition-all duration-300 backdrop-blur-sm flex flex-col gap-4 md:gap-6 justify-between"
          >
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
              <div>
                <h2 className="text-xs md:text-base font-medium text-gray-600 tracking-wide">
                  {data.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-1 md:mt-2">
                  {data.number}
                </p>
              </div>
              <div className="pl-2 md:pl-3 rounded-lg md:rounded-xl ">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">{data.icon}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 border-t border-gray-100">
              <Image
                src={
                  data.percentage === 'up'
                    ? '../freelancers/trending_up.svg'
                    : '../freelancers/trending_down.svg'
                }
                alt="trending icon"
                width={16}
                height={16}
                className="opacity-80"
              />
              <div className="text-xs md:text-sm">
                <span
                  className={`${data.percentage === 'up' ? 'text-emerald-600' : 'text-red-400'} font-medium`}
                >
                  {data.percentageNumber}%{' '}
                </span>
                <span className="text-gray-600">
                  {data.percentage === 'up' ? 'up' : 'down'} from last week
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
