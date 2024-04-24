const dns = require('dns');

const validateEmail = (email) => {
    // Split the email into domain 
    const emailParts = email?.split('@');
    const domain = emailParts[1];

    dns.resolveMx(domain, (err, addresses) => {
        if (err || addresses.length === 0) {
            return false
        } else {
            return true
        }
    });
}

module.exports = { validateEmail }