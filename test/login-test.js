const expect = require('chai').expect;
const sinon = require("sinon");
const AuthService = require("../app/services/auth.service");
const {connectDB} = require('../app/config/db');
const Server = require('../app/config/server');
const EmailerService = require('../app/services/emailer.service');

describe('validateExistEmail success', () => {
    it("existe email success", async () => {
        const server = new Server();
        server.listen();
        const result = await AuthService.validateExistEmail("nicolasjmolina1@gmail.com")
        expect(result.existEmail).to.equal(true)
    })
});


describe('validateExistEmail error', () => {
    it("existe email error", async () => {
        const result = await AuthService.validateExistEmail("")
        expect(result.existEmail).to.equal(false)
    })
});

describe('validateLoginByEmail success', () => {
    it("validate login by email success", async () => {
        const result = await AuthService.validateLoginByEmail("nicolasjmolina1@gmail.com", "123456")
        expect(result.isAuthenticated).to.equal(true)
    })
});


describe('validateLoginByEmail error', () => {
    it("validate login by email error", async () => {
        const result = await AuthService.validateLoginByEmail("", "123456")
        expect(result.isAuthenticated).to.equal(false)
    })
});

describe('createAccountByEmail success', () => {
    it("create account by email success", async () => {
        const result = await AuthService.createAccountByEmail("bandme.testunitario@gmail.com", "123456", "ARTIST", "EMAIL")
        expect(result.accountCreated).to.equal(false)
    })
});

describe('createAccountByEmail error', () => {
    it("create account by email error", async () => {
        const result = await AuthService.createAccountByEmail("", "123456", "ARTIST", "EMAIL")
        expect(result.accountCreated).to.equal(false)
    })
});

/* describe('createAccountBySocialMedia success', () => {
    it("create account by social media success", async () => {
        const result = await AuthService.createAccountBySocialMedia("bandme.testunitario@gmail.com", "GOOGLE", "ARTIST", "", "Nicolas", "Perez", "")
        expect(result.accountCreated).to.equal(true)
    })
});
 */
describe('createAccountBySocialMedia error', () => {
    it("create account by social media error", async () => {
        const result = await AuthService.createAccountBySocialMedia("", "GOOGLE", "ARTIST", "", "Nicolas", "Perez", "")
        expect(result.accountCreated).to.equal(false)
    })
});

describe('validateExistEmailResetPassword success', () => {
    it("validate exist email reset password success", async () => {
        const result = await AuthService.validateExistEmailResetPassword("bandme.testunitario@gmail.com")
        expect(result.emailValid).to.equal(true)
    })
});

describe('validateExistEmailResetPassword error', () => {
    it("validate exist email reset password error", async () => {
        const result = await AuthService.validateExistEmailResetPassword("")
        expect(result.emailValid).to.equal(false)
    })
});

describe('validateResetPasswordCode error', () => {
    it("validate code reset password error", async () => {
        const result = await AuthService.validateResetPasswordCode("")
        expect(result.isValid).to.equal(false)
    })
});

describe('sendConfirmationEmail success', () => {
    it("send Confirmation Email success", async () => {
        const result = await EmailerService.sendConfirmationEmail("bandme.testunitario@gmail.com","637ed93275978ac8767a3748")
        expect(result).to.equal(true)
    })
});

describe('sendConfirmationEmail error', () => {
    it("send Confirmation Email error", async () => {
        const result = await EmailerService.sendConfirmationEmail("","")
        expect(result).to.equal(false)
    })
});

