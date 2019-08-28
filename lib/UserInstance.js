const RbacError = require('./RbacError');

/**
 * User instance of RBAC
 */
class UserInstanceRBAC {
    constructor(rbac, roles) {
        this.roles = roles;
        this.branches = this.roles.map(role => {
            const branch = {};

            populate({rbac, ruleNames: [role], branch});

            return branch;
        });
    }

    can(ruleName, params = {}) {
        if (!this.branches.length) {
            return false;
        }

        return this.branches.some(branch => canBranch(branch, ruleName, params));
    }
}

/**
 * Populate rules
 *
 * @param {RBAC} ruleNames Rule names
 * @param {String[]} ruleNames Rule names
 * @param {Object} branch Branch (hash of populated rules)
 * @param {Object?} parent Parent rule
 */
function populate({rbac, ruleNames, branch, parent}) {
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
        parent
    }
}

module.exports = UserInstanceRBAC;