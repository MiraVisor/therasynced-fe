'use client';

import { ChevronLeft, ChevronRight, Divide, Moon, Star, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: Date;
  label: string;
  morningSlots: TimeSlot[];
  eveningSlots: TimeSlot[];
  totalAvailable: number;
}

// Mock therapist data
const therapist = {
  id: '1',
  name: 'Dr Lee Marshell',
  profession: 'Message therapy',
  yearsOfExperience: 7,
  location: 'Ireland',
  rating: 4.8,
  reviews: 1437,
  avatar: '/path/to/avatar.jpg',
};

// Mock schedule data - can be replaced with API data later
const generateMockSchedule = (): DaySchedule[] => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(today.getDate() + 2);

  return [
    {
      date: today,
      label: 'Today',
      morningSlots: [
        { time: '09:00 AM', available: true },
        { time: '09:50 AM', available: true },
        { time: '10:00 AM', available: true },
        { time: '10:50 AM', available: true },
        { time: '11:00 AM', available: true },
        { time: '11:30 AM', available: true },
        { time: '11:45 AM', available: true },
      ],
      eveningSlots: [
        { time: '09:00 PM', available: true },
        { time: '09:00 PM', available: true },
        { time: '09:00 PM', available: true },
        { time: '09:00 PM', available: true },
      ],
      totalAvailable: 6,
    },
    {
      date: tomorrow,
      label: 'Tomorrow',
      morningSlots: [
        { time: '09:00 AM', available: false },
        { time: '10:00 AM', available: false },
        { time: '11:00 AM', available: false },
      ],
      eveningSlots: [{ time: '09:00 PM', available: false }],
      totalAvailable: 0,
    },
    {
      date: dayAfter,
      label: `Wed, ${dayAfter.getDate()} May`,
      morningSlots: [
        { time: '09:00 AM', available: true },
        { time: '10:00 AM', available: true },
        { time: '11:00 AM', available: true },
        { time: '11:10 AM', available: true },
      ],
      eveningSlots: [
        { time: '09:00 PM', available: true },
        { time: '09:00 PM', available: true },
      ],
      totalAvailable: 14,
    },
  ];
};

const MyBookingHome = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    setSchedule(generateMockSchedule());
  }, []);

  const handlePreviousDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
      setSelectedTimeSlot(null);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < schedule.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
      setSelectedTimeSlot(null);
    }
  };

  const handleDaySelect = (index: number) => {
    setSelectedDayIndex(index);
    setSelectedTimeSlot(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const selectedDay = schedule[selectedDayIndex];

  return (
    <div className="flex flex-col">
      {/* Therapist Profile Section */}
      <div className="flex mb-9 gap-2">
        <div className="flex flex-col items-center justify-center h-full">
          <Avatar className="h-[144px] w-[139px] mr-4">
            <AvatarImage src={therapist.avatar} />
            <AvatarFallback className="bg-green-700 text-white text-xl">
              {therapist.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" className="p-0 hover:bg-transparent">
            View Profile
          </Button>
        </div>
        <div className="flex flex-col justify-between gap-3.5 mt-3 mb-2">
          <div className="flex flex-col justify-center gap-2.5">
            <div className="font-inter font-semibold text-base16">{therapist.name}</div>
            <div className="font-inter font-medium text-base14 text-[#525252]">
              {therapist?.profession}
            </div>
            <div className="font-inter font-medium text-base14  text-[#525252]">
              {therapist.yearsOfExperience}+ Years of Experience
            </div>
            <div className="font-inter font-medium text-base14  text-[#525252]">
              {therapist.location}
            </div>
          </div>
          <div className="flex items-center border-t pt-2 mt-2 border-[#939393]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2">{therapist.reviews} Patient Stories</span>
          </div>
        </div>
      </div>

      {/* Day Selection Tabs */}
      <div className="flex items-center mb-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          disabled={selectedDayIndex === 0}
          className="rounded-full h-10 w-10 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex justify-between px-4">
          {schedule.map((day, index) => (
            <div
              key={index}
              className={`cursor-pointer text-center flex-1 ${selectedDayIndex === index ? 'border-b-2 border-green-500 pb-2' : ''}`}
              onClick={() => handleDaySelect(index)}
            >
              <h3 className="font-medium mb-1">{day.label}</h3>
              <p className="text-sm text-gray-500">
                {day.totalAvailable} {day.totalAvailable === 1 ? 'slot' : 'slots'} Available
              </p>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          disabled={selectedDayIndex === schedule.length - 1}
          className="rounded-full h-10 w-10 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Slots Section */}
      {selectedDay && (
        <>
          {/* Morning Slots */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Sun className="mr-2 h-5 w-5" />
              <h3 className="font-medium">Morning</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {selectedDay.morningSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
                  className={`h-11 text-sm font-medium ${
                    selectedTimeSlot === slot.time
                      ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                      : 'border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-600'
                  } ${slot.available ? '' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>

          {/* Evening Slots */}
          <div>
            <div className="flex items-center mb-2">
              <Moon className="mr-2 h-5 w-5" />
              <h3 className="font-medium">Evening</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {selectedDay.eveningSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
                  className={`text-sm ${slot.available ? '' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="mt-12">
        <Button
          className="w-full"
          disabled={!selectedTimeSlot}
          onClick={() => alert(`Booking appointment for ${selectedTimeSlot}`)}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
};

export default MyBookingHome;
