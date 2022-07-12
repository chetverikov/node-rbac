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
   * @param {Object} [options] Options
   * @param {Object} [options.strategy] Any allowed or Any denied rules. RBAC.STRATEGIES.ANY_ALLOWED by default
   */
  constructor(rules, options = {}) {
    this.rules = rules;
    this.hashRules = rules.reduce((acc, rule) => {
      acc[rule.name] = rule;

      return acc;
    }, Object.create(null));

    this.strategy = Object.values(this.STRATEGIES).includes(options.strategy) ? options.strategy : this.STRATEGIES.ANY_ALLOWED;
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

RBAC.STRATEGIES = {
  ALL_ALLOWED: 'allAllowed',
  ANY_ALLOWED: 'anyAllowed',
  ALL_DENIED: 'allDenied',
  ANY_DENIED: 'anyDenied'
};

RBAC.prototype.STRATEGIES = RBAC.STRATEGIES;

module.exports = RBAC;
