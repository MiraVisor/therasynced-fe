'use client';

import AOS from 'aos';
import { ChevronDown, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import 'aos/dist/aos.css';

const expertsData = [
  {
    id: 1,
    name: 'Dr Kenneth P. Bell',
    specialty: 'Cardiologist',
    description:
      'Specialist in cardiac rehabilitation and preventive cardiology. Focused on personalised treatment plans.',
    image: '/images/doctor1.jpg',
    rating: 5,
    patients: '10k+ Clients',
    experience: '15+ Years',
  },
  {
    id: 2,
    name: 'Dr Heather K. Nichols',
    specialty: 'Neurologist',
    description:
      'Experienced neurologist offering comprehensive diagnostic and treatment services.',
    image: '/images/doctor2.jpg',
    rating: 5,
    patients: '8k+ Clients',
    experience: '12+ Years',
  },
  {
    id: 3,
    name: 'Dr Amrita Singh',
    specialty: 'Physiotherapist',
    description:
      'Focused on sports injury recovery and mobility improvement using evidence-based methods.',
    image: '/images/doctor4.jpg',
    rating: 5,
    patients: '7k+ Clients',
    experience: '10+ Years',
  },
  {
    id: 4,
    name: 'Dr Martin R. Cole',
    specialty: 'Chiropractor',
    description:
      'Manual therapy expert combining gentle adjustments with long-term wellness plans.',
    image: '/images/doctor3.jpg',
    rating: 5,
    patients: '9k+ Clients',
    experience: '18+ Years',
  },
];

const faqData = [
  {
    id: 1,
    question: 'Who can I find on the platform?',
    answer:
      'Find licensed physiotherapists, athletic therapists, massage therapists, strength & conditioning coaches, and personal trainers - all available for flexible freelance work. Whether you want to expand clinical experience, join a sports team short-term, or offer mobile/in-clinic services, our platform connects you with opportunities that match your skills and schedule.',
  },
  {
    id: 2,
    question: 'How can teams and clinics use the service?',
    answer:
      'Sports teams and clinics can quickly find experienced professionals for game-day coverage, seasonal support, or short-term contracts. This lets you scale services during peak periods, cover gaps in staff, and secure trusted freelance professionals without lengthy hiring processes.',
  },
  {
    id: 3,
    question: 'Can individuals and athletes book care directly?',
    answer:
      'Yes - individual clients and athletes can search, compare, and book qualified professionals for in-clinic, in-home, or mobile sessions. The platform simplifies booking and client acquisition so professionals can focus on delivering excellent care.',
  },
  {
    id: 4,
    question: 'Do you support events and corporate wellness?',
    answer:
      'We help organisations, event coordinators, and companies find reliable professionals for tournaments, camps, wellness days, and corporate programmes. Book on-site or short-term support easily to improve participant wellbeing and event logistics, all through a single platform.',
  },
];

const Freelancers = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Duplicate the experts list so the marquee loops smoothly
  const repeatedExperts = [...expertsData, ...expertsData];

  return (
    <section
      id="freelancers"
      className="w-full pt-6 sm:pt-10 lg:pt-16 transition-all duration-500 bg-gray-50 mt-16"
    >
      <div className="flex flex-col items-center gap-8 sm:gap-6 lg:gap-8">
        {/* Header */}
        <div
          className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 "
          data-aos="fade-up"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Meet Our Expert <span className="text-primary">Specialists</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            Our board-certified specialists combine years of experience with cutting-edge treatment
            approaches to provide personalised care for your healing journey.
          </p>
        </div>

        {/* Experts Slider - Marquee-style continuous scroll */}
        <div className="w-full max-w-7xl mx-auto transform lg:translate-y-24 relative z-20">
          <div className="overflow-hidden">
            <div
              className="marquee flex gap-2 items-stretch will-change-transform px-2"
              aria-hidden
            >
              {repeatedExperts.map((expert, idx) => (
                <div
                  key={`${expert.id}-${idx}`}
                  className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/3 min-w-[300px] pr-2"
                  data-aos="fade-up"
                  data-aos-delay={(idx % expertsData.length) * 100}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 transform hover:-translate-y-2 min-h-[460px] group">
                    {/* Image Container */}
                    <div className="relative">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                        <Image
                          src={expert.image}
                          alt={expert.name}
                          fill
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 text-left space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {expert.name}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">{expert.specialty}</div>
                        <p className="text-sm text-gray-600 mt-2 max-h-[4.5rem] overflow-hidden leading-relaxed">
                          {expert.description}
                        </p>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-start gap-3 mt-3">
                        <div className="flex gap-0.5">
                          {[...Array(expert.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {expert.rating}.0
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="font-medium">{expert.experience}</span>
                        <span className="font-medium">{expert.patients}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Healthcare Section - Softer green background that cards overlap into */}
        <div className="w-full  bg-[#007745]/80  -mt-12 lg:-mt-20 relative z-0 pt-12 lg:pt-20 pb-12 lg:pb-24">
          <div className="max-w-6xl mx-auto py-6 md:py-12 lg:py-20 lg:min-h-[500px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-start relative overflow-visible mt-10">
            {/* Left Column - FAQ Section */}
            <div
              className="text-white"
              data-aos="fade-right"
              data-aos-once="false"
              data-aos-mirror="true"
              data-aos-delay="400"
            >
              <h3 className="text-3xl md:text-4xl font-extrabold mb-3">
                Your Questions, <span className="text-primary-light">Answered</span>
              </h3>

              <div className="w-24 h-1 bg-white/30 rounded mb-8" />

              <p className="mb-8 text-white/90 leading-relaxed">
                Delivering expert care with compassion. Our specialists create tailored treatment
                plans and provide continuous support so you can recover confidently and return to
                your best self.
              </p>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                {faqData.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/15"
                    data-aos="fade-up"
                    data-aos-once="false"
                    data-aos-mirror="true"
                    data-aos-delay={idx * 100}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      aria-expanded={expandedFaq === faq.id}
                      aria-controls={`faq-panel-${faq.id}`}
                      className="w-full px-5 py-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-white/95 text-sm md:text-base">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-white/90 transition-transform duration-300 ${
                            expandedFaq === faq.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={`faq-panel-${faq.id}`}
                      className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        expandedFaq === faq.id ? 'max-h-[40rem]' : 'max-h-0'
                      }`}
                    >
                      <div
                        className={`px-5 py-4 border-t border-white/10 transform transition-opacity duration-300 ease-in-out ${
                          expandedFaq === faq.id
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                      >
                        {faq.answer.split('\n\n').map((para, i) => (
                          <p
                            key={i}
                            className="text-white/80 text-sm leading-relaxed mb-3 last:mb-0"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Image */}
            <div
              className="relative w-full max-w-[480px] mx-auto lg:mx-0 h-[500px]"
              data-aos="fade-left"
              data-aos-once="false"
              data-aos-mirror="true"
              data-aos-delay="200"
            >
              <div className="relative w-full max-w-[420px] mx-auto lg:ml-auto h-full">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-1 relative z-10">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={'/images/physio/chiropractor-provides-aid-patient.jpg'}
                      alt="Expert specialist caring for patient"
                      fill
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Freelancers;
