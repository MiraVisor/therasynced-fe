const sampleAppointments = [
  {
    id: 1,
    time: '09:00 AM',
    date: 'Mar 15, 2024',
    clientName: 'Sarah Johnson',
    type: 'Therapy Session',
    status: 'confirmed',
    duration: '60 min',
  },
  {
    id: 2,
    time: '11:30 AM',
    date: 'Mar 15, 2024',
    clientName: 'Michael Chen',
    type: 'Initial Consultation',
    status: 'pending',
    duration: '45 min',
  },
  {
    id: 3,
    time: '02:00 PM',
    date: 'Mar 15, 2024',
    clientName: 'Emma Wilson',
    type: 'Follow-up Session',
    status: 'confirmed',
    duration: '60 min',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
};

const AppointmentCard = ({ appointment }: { appointment: (typeof sampleAppointments)[0] }) => (
  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 transition-all duration-200 rounded-xl group border border-gray-100 hover:border-gray-200 hover:shadow-sm">
    <div className="flex-shrink-0 w-full sm:w-20 flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
      <div className="text-sm sm:text-base font-semibold text-gray-900">{appointment.time}</div>
      <div className="text-xs sm:text-sm text-gray-500 sm:mt-1">{appointment.date}</div>
    </div>
    <div className="flex-1 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 md:gap-4">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate transition-colors">
            {appointment.clientName}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 mt-1 sm:mt-1.5 md:mt-2">
            <span className="text-sm sm:text-base text-gray-600 font-medium">
              {appointment.type}
            </span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="text-sm sm:text-base text-gray-600">{appointment.duration}</span>
          </div>
        </div>
        <span
          className={`text-xs sm:text-sm font-medium px-2 sm:px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${getStatusColor(appointment.status)} self-start sm:self-auto`}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
    </div>
  </div>
);

const TodayAppointments = () => {
  const hasAppointments = Boolean(sampleAppointments.length > 0);

  return (
    <div className="p-4 sm:p-5 md:p-6 w-full border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/90 rounded-xl sm:rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 md:mb-5">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          Today&apos;s Appointments
        </h2>
      </div>

      {hasAppointments ? (
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {sampleAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[160px] sm:h-[180px] md:h-[240px] text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            No appointments scheduled for today
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Your schedule is clear</p>
        </div>
      )}
    </div>
  );
};

export default TodayAppointments;
