import React from 'react';
import LegalLayout from '../components/LegalLayout.jsx';
import { SITE } from '../config/site.js';

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance and eligibility',
      paras: [
        `These Terms and Conditions govern your use of ${SITE.name}. By creating an account, searching or booking, you agree to them together with our Privacy Policy. You must be at least 18 years old and able to enter into a binding contract under Indian law.`,
      ],
    },
    {
      title: 'What we do',
      paras: [
        `${SITE.name} is an online platform that lets you search for and book travel services offered by third parties: airlines, railways, bus operators and hotels. We act as an intermediary. Your contract for the journey or stay is with the provider, and the provider's own terms, fare rules and cancellation policy apply to it. We are not the carrier or the hotel and do not control their schedules or services.`,
      ],
    },
    {
      title: 'Your account',
      paras: [
        'You are responsible for the information in your account and for keeping your password confidential. Tell us at once if you think someone else is using your account. You must give accurate information and must not use another person\'s account or payment method without permission.',
      ],
    },
    {
      title: 'Prices and bookings',
      list: [
        'The total you pay is shown at checkout before payment. It is made up of the base fare, taxes (including GST where applicable), any provider fee, our service fee, less any discount.',
        'Fares, seats and rooms are set by providers and can change until your booking is confirmed.',
        'A booking is complete only when we show it as confirmed or ticketed in My Bookings. If payment succeeds but the provider cannot confirm your booking, we will refund the amount you paid.',
        'Coupon codes are valid only as described when you apply them, can be used once per booking, and may be withdrawn or changed.',
        'Any part of our service fee that is not refundable on cancellation will be stated before you pay.',
      ],
    },
    {
      title: 'Payments',
      paras: [
        'Payments are processed by Razorpay using the payment methods it offers at checkout. Your use of Razorpay is subject to its own terms. We do not receive or store your card, UPI or bank credentials. A payment is treated as received only after Razorpay confirms it to us.',
      ],
    },
    {
      title: 'Traveller details',
      paras: [
        'Enter each traveller\'s name exactly as it appears on their valid photo ID, along with correct age and gender. Mistakes can lead to denied travel or change fees charged by the provider. You are responsible for carrying the ID and documents the provider requires and for reaching the airport, station, boarding point or hotel on time.',
      ],
    },
    {
      title: 'Cancellations, changes and refunds',
      paras: [
        'You can request a cancellation from My Bookings. Whether you get a refund, and how much, depends on the fare rules of the airline, railway, bus operator or hotel and on the cancellation charges they apply. Approved refunds are returned to the original payment method. The time a refund takes also depends on Razorpay and your bank.',
        'If a provider cancels or reschedules a service, the provider\'s policy decides your options, and we will help you claim what you are entitled to.',
      ],
    },
    {
      title: 'Trip planner and search suggestions',
      paras: [
        'The trip planner and plain language search use an AI model. Their itineraries, cost estimates and search interpretations can be wrong or out of date. Check timings, prices, opening hours and entry rules yourself before you rely on them. Fares and availability you book come from providers, not from the AI model.',
      ],
    },
    {
      title: 'Acceptable use',
      paras: ['You agree not to:'],
      list: [
        'use the service for anything unlawful or fraudulent;',
        'make bookings you do not intend to use, or bulk or automated bookings;',
        'attempt to access accounts, systems or data that are not yours, or to disrupt the service;',
        'copy, scrape or resell our content or search results without our written permission.',
      ],
    },
    {
      title: 'Intellectual property',
      paras: [`The ${SITE.name} name, logo, software and site content belong to us or our licensors. Provider names and logos belong to their owners. You may use the service for your own personal travel but may not otherwise copy or reuse it.`],
    },
    {
      title: 'Suspension',
      paras: ['We may suspend or close an account, or cancel a booking where the law allows, if we reasonably believe there is fraud, misuse or a breach of these terms. We will tell you why unless the law stops us.'],
    },
    {
      title: 'Liability',
      paras: [
        'We are responsible for our own service as an intermediary. We are not liable for the acts, omissions, delays or cancellations of providers, or for events outside our reasonable control. To the extent the law permits, our total liability to you for a booking is limited to the amount you paid us for that booking.',
        'Nothing in these terms limits any right you have under the Consumer Protection Act, 2019 or any liability that cannot be excluded by law.',
      ],
    },
    {
      title: 'Complaints',
      paras: [
        'Write to our Grievance Officer using the details below. We acknowledge a complaint within 48 hours and aim to resolve it within one month of receiving it, as required by the Consumer Protection (E-Commerce) Rules, 2020.',
      ],
    },
    {
      title: 'Governing law',
      paras: [
        `These terms are governed by the laws of India.${SITE.jurisdictionCity ? ` Subject to any consumer rights you have to bring a claim elsewhere, the courts at ${SITE.jurisdictionCity} have jurisdiction.` : ' Subject to any consumer rights you have to bring a claim elsewhere, the competent courts in India have jurisdiction.'}`,
      ],
    },
    {
      title: 'Changes to these terms',
      paras: ['We may update these terms. The date at the top shows the latest version. Bookings you have already made stay under the terms that applied when you made them.'],
    },
  ];

  return (
    <LegalLayout
      title="Terms and Conditions"
      intro="Please read these terms before you book. They explain how this website works, what we are responsible for and what you agree to."
      sections={sections}
    />
  );
}
