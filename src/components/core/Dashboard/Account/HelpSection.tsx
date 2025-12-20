'use client';

import { ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { HelpSectionSkeleton } from '@/components/ui/skeletons/HelpSectionSkeleton';
import { useProfile } from '@/hooks/queries/useProfile';

export function HelpSection() {
  const { data: profileData, isLoading: loading, isFetching: initialLoading } = useProfile();
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());

  const toggleFaq = (faqId: string) => {
    setExpandedFaqs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  if ((initialLoading || loading) && !profileData) {
    return <HelpSectionSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-6">Help & Support</h3>

        <div className="space-y-6">
          {/* Contact Admin Button */}
          <div className="text-center py-8">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h4>
            <p className="text-gray-600 mb-6">Contact our admin team for personalized assistance</p>
            <Button
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-12 px-8"
              onClick={() => toast.info('Contact admin functionality coming soon')}
            >
              Contact Admin
              <Mail className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h4>

            {[
              {
                id: 'faq1',
                question: 'How do I update my profile information?',
                answer:
                  'You can update your profile information in the Profile tab. Simply edit the fields and click "Save Changes" to apply your updates.',
              },
              {
                id: 'faq2',
                question: 'How do I change my password?',
                answer:
                  'Go to the Account tab and use the Password Management section. Enter your current password, then your new password twice to confirm.',
              },
              {
                id: 'faq3',
                question: 'How do I manage my notification preferences?',
                answer:
                  'Navigate to the Notifications tab to configure your email, push, and SMS notification settings according to your preferences.',
              },
              {
                id: 'faq4',
                question: 'What should I do if I forgot my password?',
                answer:
                  'If you forgot your password, you can reset it through the login page. Click on "Forgot Password" and follow the instructions sent to your email.',
              },
            ].map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaqs.has(faq.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaqs.has(faq.id) && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
