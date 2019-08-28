const RbacError = require('./RbacError');
const UserInstance = require('./UserInstance');

class RBAC {

  /**
   * Constructor
   *
   * @param {Object[]} rules Rules
   * @param {String}   rules.name Rule's name
   * @param {String[]} rules.children Children of rule
   * @param {Function} rules.filter Filter
   */
  constructor(rules) {
    this.rules = rules;
    this.hashRules = rules.reduce((acc, rule) => {
      acc[rule.name] = rule;

      return acc;
    }, Object.create(null));
  }

  /**
   * Get user instance of RBAC
   *
   * @param {String[]} roles
   * @returns {UserInstanceRBAC}
   */
  getInstance(roles) {
    return new UserInstance(this, roles);
  }

  static get RbacError() {
    return RbacError;
  }
}

module.exports = RBAC;