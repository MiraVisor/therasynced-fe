'use client';

import { Briefcase, Clock, Heart, Lock, Shield, Star, UserCheck, Users, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const infoBlocks = [
  {
    id: 'freelancer',
    icon: UserCheck,
    title: 'For Freelancers',
    description:
      'Find flexible, paid work that fits your schedule. Therasynced connects you with freelance and locum job opportunities across clinics, sports teams, gyms, and organisations. Create a profile, showcase your qualifications, availability, and pricing and book roles that match your skills—no long-term commitments, just clear opportunities and straightforward payments.',
    highlight: 'Flexible opportunities',
  },
  {
    id: 'employer',
    icon: Briefcase,
    title: 'For Employers',
    description:
      "Hire qualified therapists, coaches and trainers quickly and confidently. Book the right person for your needs—whether it's in clinic short-term cover, event support, or match day cover. Our platform streamlines sourcing, communication, and scheduling, so you can focus on delivering high-quality care and performance support without staffing headaches.",
    highlight: 'Quality talent',
  },
];

const benefits = [
  {
    id: 1,
    icon: Shield,
    title: 'Verified Professionals',
    description:
      "Every therapist on our platform is thoroughly vetted. We verify licences, check credentials, and ensure you're working with qualified experts who know their craft.",
    highlight: 'Licence verified',
  },
  {
    id: 2,
    icon: Lock,
    title: 'Your Privacy, Protected',
    description:
      'We use bank-level encryption to keep your data safe. Your sessions, messages, and personal information stay strictly between you and your therapist.',
    highlight: 'End-to-end encrypted',
  },
  {
    id: 3,
    icon: Zap,
    title: 'Book in Under 60 Seconds',
    description:
      'No more endless phone calls or waiting for callbacks. Find an available therapist, pick a slot, and confirm—all in less than a minute.',
    highlight: 'Instant booking',
  },
  {
    id: 4,
    icon: Clock,
    title: 'Flexible Scheduling',
    description:
      "Life is unpredictable. That's why we offer appointments from early morning to late evening, including weekends. Find a time that actually fits your schedule.",
    highlight: '7 days a week',
  },
  {
    id: 5,
    icon: Users,
    title: 'Real Reviews, Real People',
    description:
      "Read honest feedback from clients who've been in your shoes. Our review system is transparent—no fake ratings, just genuine experiences.",
    highlight: 'Verified reviews',
  },
  {
    id: 6,
    icon: Heart,
    title: 'Personalised Matching',
    description:
      "Tell us what you're looking for and we'll help find the right fit. Whether it's sports recovery, chronic pain, or relaxation—we match you with specialists.",
    highlight: 'AI-powered matching',
  },
];

const testimonials = [
  {
    id: 1,
    text: "Finally found a physiotherapist who actually listens. The booking process was so easy, I wish I'd found TheraSynced sooner!",
    author: 'Sarah M.',
    role: 'Marathon Runner',
    rating: 5,
  },
  {
    id: 2,
    text: 'As someone with chronic back pain, having verified professionals I can trust is everything. The reviews helped me find the perfect match.',
    author: 'James K.',
    role: 'Software Developer',
    rating: 5,
  },
  {
    id: 3,
    text: 'I love the flexibility—I can book late evening sessions after work. The platform makes scheduling so easy!',
    author: 'Emily R.',
    role: 'Nurse',
    rating: 5,
  },
];

const Benefits = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            benefits.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => [...prev, index]);
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-5 mb-16 sm:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Why Choose Us
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Built for <span className="text-primary">You</span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're not just another booking platform. We're your partner in wellness, designed to
            make finding and connecting with the right therapist effortless.
          </p>
        </div>

        {/* Info Blocks - Freelancer & Employer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {infoBlocks.map((block) => (
            <div
              key={block.id}
              className="group relative p-8 lg:p-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-emerald-500/5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-default overflow-hidden"
            >
              {/* Highlight badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {block.highlight}
              </div>

              {/* Icon */}
              <div className="mb-6 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <block.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {block.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {block.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`group relative p-6 lg:p-8 rounded-2xl border border-gray-200 bg-white hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-default overflow-hidden ${
                visibleItems.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
            >
              {/* Highlight badge */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {benefit.highlight}
              </div>

              {/* Icon */}
              <div className="mb-5 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <benefit.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="relative bg-gradient-to-r from-primary/5 via-emerald-500/5 to-teal-500/5 rounded-3xl p-8 lg:p-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              What Our Clients Say
            </h3>
            <p className="text-gray-600"
              Real stories from people who found their perfect match
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="relative max-w-3xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-500 ${
                  index === activeTestimonial
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 absolute inset-0 translate-x-8'
                }`}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg sm:text-xl text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900"
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500"
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeTestimonial
                    ? 'w-8 bg-primary'
                    : 'bg-gray-300 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
