// One fictional example follows the visitor through all four scenes.
export const STORY = Object.freeze({
  student: Object.freeze({
    name: 'Alex Karimov',
    nationality: 'Uzbekistan',
    journeyId: 'STU-2026-0147',
    field: 'Computer Science',
    budget: '€10,000 / year',
    language: 'IELTS 6.5',
    priority: 'Scholarship'
  }),
  journey: Object.freeze({
    destination: 'Finland',
    city: 'Helsinki',
    university: 'Aurora Study Campus',
    initialStatus: 'Exploring',
    selectedStatus: 'Planning',
    applicationStatus: 'Submitted',
    admissionStatus: 'Admitted',
    visaStatus: 'Ready to travel'
  })
});
