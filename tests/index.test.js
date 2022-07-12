const RBAC = require('../lib');
const test = require('ava');
const mocks = require('./mocks');

let rbac;

test.before(() => {
  rbac = new RBAC(mocks.rules);
});

test('should allow access for administrator', t => {
  const instance = rbac.getInstance(['Administrator']);

  t.true(instance.can('create company'));
  t.true(instance.can('update company'));
  t.true(instance.can('remove company'));
  t.true(instance.can('view companies'));
  t.true(instance.can('view company'));
});

test('should allow access for manager without remove', t => {
  const instance = rbac.getInstance(['Manager']);

  t.true(instance.can('create company'));
  t.true(instance.can('update company'));
  t.true(instance.can('view companies'));
  t.true(instance.can('view company'));

  t.false(instance.can('remove company'));
});

test('should allow to view for users', t => {
  const instance = rbac.getInstance(['User']);

  t.true(instance.can('view companies'));
  t.true(instance.can('view company'));

  t.false(instance.can('create company'));
  t.false(instance.can('update company'));
  t.false(instance.can('remove company'));
});

test('should allow to manage own places for account owner', t => {
  const instance = rbac.getInstance(['Account Owner']);
  const params = {
    account: {companies: [1,2,3]},
    company: {_id: 2}
  };
  const incorrectParams = {
    account: {companies: [1,2,3]},
    company: {_id: 5}
  };

  t.true(instance.can('view companies'));
  t.true(instance.can('view company'));

  t.true(instance.can('create company', params));
  t.true(instance.can('update company', params));
  t.true(instance.can('remove company', params));

  t.false(instance.can('update company', incorrectParams));
  t.false(instance.can('remove company', incorrectParams));
});

test('should merge rules from two roles', t => {
  const rbac = new RBAC([
    {
      name: 'Companies updater',
      children: ['company update']
    },
    {
      name: 'Companies viewer',
      children: ['company view']
    },
    {
      name: 'company update'
    },
    {
      name: 'company view'
    }
  ]);
  const instance = rbac.getInstance(['Companies updater', 'Companies viewer']);

  t.true(instance.can('company update'));
  t.true(instance.can('company view'));
});

test('should allow when rule return false in one of roles but another return true', t => {
  const rbac = new RBAC([
    {
      name: 'Companies city updater',
      children: ['company city update']
    },
    {
      name: 'Companies region manager',
      children: ['company region update']
    },
    {
      name: 'company city update',
      filter: params => {
        return params.city.indexOf(params.company) > -1;
      },
      children: ['company update']
    },
    {
      name: 'company region update',
      filter: params => {
        return params.region.indexOf(params.company) > -1;
      },
      children: ['company update']
    },
    {
      name: 'company update'
    }
  ]);
  const instance = rbac.getInstance(['Companies city updater', 'Companies region manager']);

  t.true(instance.can('company update', {city:[5], region:[3], company: 5}));
  t.true(instance.can('company update', {city:[3], region:[5], company: 5}));
  t.true(instance.can('company update', {city:[5], region:[5], company: 5}));
  t.false(instance.can('company update', {city:[1], region:[2], company: 5}));
});

test('should return false when a rule is denied and a ANY_DENIED strategy was passed', t => {
  const rbac = new RBAC([
    {
      name: 'Companies city updater',
      children: ['company city update']
    },
    {
      name: 'company city update',
      deny: true,
      children: ['company update']
    },
    {
      name: 'company update'
    }
  ], { strategy: RBAC.STRATEGIES.ANY_DENIED });
  const instance = rbac.getInstance(['Companies city updater']);

  t.false(instance.can('company update'));
});

test('should return true when a rule is denied and a ALL_DENIED strategy was passed', t => {
  const rules = [
    {
      name: 'company update'
    },

    // company city updater
    {
      name: 'Companies city updater',
      children: ['company city update']
    },
    {
      name: 'company city update',
      deny: true,
      children: ['company update']
    },

    // company region updater
    {
      name: 'Companies region updater',
      children: ['company region update']
    },
    {
      name: 'company region update',
      children: ['company update']
    }
  ]
  const rbac = new RBAC(rules, { strategy: RBAC.STRATEGIES.ALL_DENIED });
  const instance = rbac.getInstance(['Companies city updater', 'Companies region updater']);

  t.true(instance.can('company update'));
});

test('should return false when some rule is denied and a ALL_ALLOWED strategy was passed', t => {
  const rules = [
    {
      name: 'company update'
    },

    // company city updater
    {
      name: 'Companies city updater',
      children: ['company city update']
    },
    {
      name: 'company city update',
      deny: true,
      children: ['company update']
    },

    // company region updater
    {
      name: 'Companies region updater',
      children: ['company region update']
    },
    {
      name: 'company region update',
      children: ['company update']
    }
  ]
  const rbac = new RBAC(rules, { strategy: RBAC.STRATEGIES.ALL_ALLOWED });
  const instance = rbac.getInstance(['Companies city updater', 'Companies region updater']);

  t.false(instance.can('company update'));
});
