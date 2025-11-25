export const mockDashboard = {
  newLeads: 7,
  qualifiedLeads: 24,
  sentEmails: 56,
  publishedPosts: 8,
  latestLeads: [
    { companyName: 'Studio Nova', email: 'info@studionova.hr', createdAt: new Date().toISOString() },
    { companyName: 'Alfa d.o.o.', email: 'kontakt@alfa.hr', createdAt: new Date().toISOString() },
    { companyName: 'Beta Agency', email: 'hello@beta.agency', createdAt: new Date().toISOString() },
  ],
  latestMessages: [
    { name: 'Maja', message: 'Možemo li dogovoriti termin?' },
    { name: 'Ivan', message: 'Trebamo ponudu za web.' },
  ],
};

export const mockBlogPosts = [
  { id: 1, title: 'Kako optimizirati web za bržu isporuku', status: 'draft', createdAt: new Date().toISOString() },
  { id: 2, title: '5 savjeta za dobar landing page', status: 'published', createdAt: new Date().toISOString() },
];

export const mockLeads = [
  {
    id: 1,
    companyName: 'Studio Nova',
    firstName: 'Maja',
    lastName: 'Kovač',
    email: 'maja@studionova.hr',
    city: 'Zagreb',
    isQualified: true,
  },
  {
    id: 2,
    companyName: 'Digitalni Val',
    firstName: 'Marko',
    lastName: 'Valić',
    email: 'marko@val.digital',
    city: 'Split',
    isQualified: false,
  },
  {
    id: 3,
    companyName: 'Green Labs',
    firstName: 'Ivana',
    lastName: 'Perić',
    email: 'ivana@greenlabs.hr',
    city: 'Rijeka',
    isQualified: true,
  },
];

export const mockTemplates = [
  { id: 1, name: 'Welcome', subject: 'Dobrodošli u Fresh Studio', bodyHtml: '<p>Pozdrav {{firstName}},</p>' },
  { id: 2, name: 'Follow up', subject: 'Provjera nakon upita', bodyHtml: '<p>Javljamo se povodom vašeg upita.</p>' },
];

export const mockCampaigns = [
  { id: 101, name: 'Split kvalificirani', status: 'draft', totalRecipients: 8, sentCount: 0, failedCount: 0 },
  { id: 102, name: 'Welcome serija', status: 'scheduled', totalRecipients: 24, sentCount: 10, failedCount: 0 },
];

export const mockServices = [
  { id: 1, name: 'Fresh API', baseUrl: 'https://dev.freshstudio.hr', healthcheckPath: '/health', description: 'Glavni API' },
  { id: 2, name: 'Landing', baseUrl: 'https://dev.freshstudio.hr/landing', healthcheckPath: '/api/health', description: 'Web landing' },
];
