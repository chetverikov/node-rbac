const RbacError = require('./RbacError');

/**
 * User instance of RBAC
 */
class UserInstanceRBAC {
    constructor(rbac, roles) {
        this.rbac = rbac;
        this.roles = roles;
        this.branches = this.roles.map(role => {
            const branch = {};

            populate({ rbac, ruleNames: [role], branch });

            return branch;
        });
    }

    /**
     * Can
     *
     * @param {String} ruleName Rule name
     * @param {Object} [params] Any data for filter
     * @returns {boolean|*}
     */
    can(ruleName, params = {}) {
        if (!this.branches.length) {
            return false;
        }

        const isAllStrategy = [this.rbac.STRATEGIES.ALL_DENIED, this.rbac.STRATEGIES.ALL_ALLOWED].includes(this.rbac.strategy);
        const isDeniedStrategy = [this.rbac.STRATEGIES.ANY_DENIED, this.rbac.STRATEGIES.ALL_DENIED].includes(this.rbac.strategy);
        const methodName = isAllStrategy ? 'every' : 'some';

        const can = this.branches[methodName](branch => canBranch(branch, ruleName, params));

        return isAllStrategy && isDeniedStrategy ? !can : can;
    }
}

/**
 * Populate rules
 *
 * @param {RBAC} rbac Instance of RBAC
 * @param {String[]} ruleNames Rule names
 * @param {Object} branch Branch (hash of populated rules)
 * @param {Object?} parent Parent rule
 */
function populate({ rbac, ruleNames, branch, parent}) {
    return ruleNames.map(ruleName => {
        const rule = branch[ruleName] || rbac.hashRules[ruleName];

        if (!rule) {
            throw new RbacError(`Not found rule "${ruleName}"${parent && ` in ${parent.name}` || ''}`);
        }

        branch[ruleName] = cloneRule(rule, parent);

        if (branch[ruleName].children && branch[ruleName].children.length) {
            branch[ruleName].children = populate({
                rbac,
                ruleNames: branch[ruleName].children,
                parent: branch[ruleName],
                branch
            });
        }

        return branch[ruleName];
    });
}

function ruleProcess(rule, params) {
    if (typeof rule.deny === 'boolean' && rule.deny) {
        return false;
    }

    // if filter exists or it returns false then return false
    if (typeof rule.filter === 'function') {
        if (!rule.filter.call(undefined, params)) {
            return false;
        }
    }

    // if current rule is root
    if (!rule.parent) {
        return true;
    }

    return ruleProcess(rule.parent, params);
}

function canBranch(branch, ruleName, params) {
    const rule = branch[ruleName];

    if (!rule) {
        return false;
    }

    return ruleProcess(rule, params);
}

function cloneRule(rule, parent) {
    return {
        name: rule.name,
        children: Array.isArray(rule.children) && rule.children.length ? [...rule.children] : null,
        filter: rule.filter,
        deny: rule.deny,
        parent
    }
}

module.exports = UserInstanceRBAC;
