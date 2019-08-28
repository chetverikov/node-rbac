const rules = [
  {
    name: 'Administrator',
    children: [
      'create company',
      'update company',
      'remove company',
      'view company',
      'view companies'
    ]
  },
  {
    name: 'Manager',
    children: [
      'create company',
      'update company',
      'view company',
      'view companies'
    ]
  },
  {
    name: 'Viewer',
    children: ['view company', 'view companies']
  },
  {
    name: 'User',
    children: ['Viewer']
  },
  {
    name: 'Account Owner',
    children: [
      'Viewer',
      'Manager own companies'
    ]
  },
  {
    name: 'Manager own companies',
    children: [
      'create company',
      'remove company',
      'update company'
    ],
    filter: params => {
      return params.account.companies.indexOf(params.company._id) > -1;
    }
  },
  {
    name: 'create company'
  },
  {
    name: 'update company'
  },
  {
    name: 'remove company'
  },
  {
    name: 'view company'
  },
  {
    name: 'view companies'
  }
];

module.exports = {rules};