# node-rbac

It is implementation of hierarchical role based account control implementation for node (with filters).

## Install

Install it using following command:

```> npm install node-rbac```

## Rule schema

```js
    {
        name: String,        // required. Name of rule
        children: [String],  // optional. List of rules 
        filter: () => {}     // optional. Test functions which returns true/false
    }
```

## Usage

```js
const RBAC = require('node-rbac');

// Create a main instance of RBAC with all tree of rules
const rbac = new RBAC([
  {
    name: 'Guest',
    children: [
      'Comments viewer',
      'Posts viewer'
    ]
  },

  {
    name: 'User',
    children: [
      'Users viewer', 'users self manage',
      'Comments viewer', 'comments self manage', 'comments create',
    ]
  },

  {
    name: 'Comment Manager', // can delete any comment, because doesn't have rule with filter
    children: [
      'Users viewer', 'users self manage',
      'comments update', 'comments delete', 'comments create',
    ]
  },

  {
    name: 'Comments viewer',
    children: ['comments one', 'comments list']
  },
  {
    name: 'comments self manage',
    children: ['comments update', 'comments delete'],
    filter: params => String(params.userId) === String(params.commentAuthorId) // returns true if current user is author of comment
  },

  {
    name: 'comments create'
  },
  {
    name: 'comments one'
  },
  {
    name: 'comments list'
  },
  {
    name: 'comments update'
  },
  {
    name: 'comments delete'
  }
]);

// Create instance of RBAC for selected roles
const userRbac = rbac.getInstance(['User']);
const params = {userId, commentAuthorId};

if (userRbac.can('comments delete', params)) {
    // delete comment
}

```