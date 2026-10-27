import React from 'react';
import LegalLayout from '../components/LegalLayout.jsx';
import { SITE } from '../config/site.js';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Who we are',
      paras: [
        `${SITE.name} is a website for searching and booking flights, trains, buses and hotels for travel within India. In this policy, "we", "us" and "our" mean the operator named under Contact and Grievance Officer below. For the personal data described here, we are the Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP Act).`,
        'By creating an account or making a booking you agree to this policy. If you do not agree, please do not use the service.',
      ],
    },
    {
      title: 'What we collect',
      paras: ['We collect only what the service needs to work.'],
      list: [
        'Account details: your name, email address, phone number (if you give one) and a password. We store your password only as a one-way hash, never as plain text.',
        'Travel preferences you choose to save: seat, meal and budget preferences.',
        'Travel documents you choose to save in your account: passport number, expiry date and issuing country. These are optional and are used only to pre-fill traveller details.',
        'Traveller details for each booking: name, age, gender, seat or berth, and an ID proof number if you enter one.',
        'Booking and trip records: what you booked, booking reference, operator reference, fare breakdown, status and cancellation reason, and the trips and itinerary items you create.',
        'Payment records: the Razorpay order and payment identifiers, amount, currency and status. Card, UPI and bank credentials are entered on Razorpay Checkout and are not received or stored by us.',
        'Text you type into the search box and the trip planner. This text is processed by an AI model (see section 4).',
        'Technical data: IP address, browser details, requested pages and error logs, which our servers record for security and troubleshooting.',
      ],
    },
    {
      title: 'Why we use your data',
      list: [
        'To create and secure your account and sign you in.',
        'To search for, book, change and cancel travel on your behalf, and to issue your ticket or voucher.',
        'To take payments, confirm bookings and process refunds.',
        'To send you booking and account notifications.',
        'To answer support requests and resolve disputes.',
        'To detect fraud and misuse and to keep the service secure.',
        'To comply with applicable law, including tax and accounting rules and lawful requests from authorities.',
      ],
      after: ['We use your data for these purposes on the basis of your consent and for the legitimate uses permitted by the DPDP Act, such as performing the booking you asked for and meeting legal obligations. We do not use your data for advertising and we do not sell it.'],
    },
    {
      title: 'Who we share it with',
      paras: ['We share data only as needed to deliver what you ask for.'],
      list: [
        'Travel providers: airlines, railways, bus operators, hotels and their booking platforms receive the traveller details needed to issue your ticket or reservation.',
        'Razorpay Software Private Limited processes your payment under its own terms and privacy policy.',
        'Google: the text you type into search and the trip planner is sent to Google\'s Gemini API to interpret your request or draft an itinerary. We do not send your name, email or booking details in these requests. Your browser also loads fonts from Google Fonts.',
        'Data providers: route and date searches (not personal data) are sent to flight and train data providers.',
        'Authorities, courts and regulators, when we are required by law to disclose information.',
      ],
    },
    {
      title: 'Browser storage',
      paras: [
        'We store a sign-in token and your account role in your browser\'s local storage so that you stay signed in. We do not use advertising or tracking cookies. Razorpay Checkout may set its own cookies or storage when you pay. You can clear local storage or sign out at any time, which removes the token from your device.',
      ],
    },
    {
      title: 'How long we keep data',
      paras: [
        'We keep account data while your account is active. Booking, payment and invoice records are kept for as long as the law requires us to keep them, and for as long as needed to handle disputes and refunds. When data is no longer needed for these purposes we delete it or remove the link to you.',
      ],
    },
    {
      title: 'Your rights',
      paras: ['Under the DPDP Act you have the right to:'],
      list: [
        'get a summary of the personal data we hold about you and how it is used;',
        'ask us to correct inaccurate data or complete incomplete data;',
        'ask us to erase your data, unless we must keep it by law;',
        'withdraw your consent, which will not affect what we did before you withdrew it;',
        'get your grievance addressed, and to nominate another person to exercise these rights if you die or become incapacitated.',
      ],
      after: ['You can update your name, phone, preferences and travel documents from your Account page. For anything else, write to our Grievance Officer using the details below. If you are not satisfied with our response, you may approach the Data Protection Board of India.'],
    },
    {
      title: 'Security',
      paras: [
        'We use access controls, hashed passwords and encrypted connections (HTTPS) to protect your data. No system is completely secure. If a personal data breach affects you, we will notify you and the Data Protection Board of India as the law requires.',
      ],
    },
    {
      title: 'Children',
      paras: [
        `Accounts on ${SITE.name} are for people aged 18 or older. A parent or guardian may book travel for a child as a passenger under their own account. We do not knowingly create accounts for children.`,
      ],
    },
    {
      title: 'Changes to this policy',
      paras: ['We may update this policy. The date at the top shows when it last changed. If a change is significant we will tell you on the website or by email before it applies.'],
    },
    {
      title: 'Governing law',
      paras: ['This policy is governed by the laws of India, including the Information Technology Act, 2000 and the DPDP Act.'],
    },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This policy explains what personal data we collect when you use this website, why we collect it, who we share it with, and the choices you have."
      sections={sections}
    />
  );
}
