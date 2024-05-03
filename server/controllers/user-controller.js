const userService = require('../service/user-service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error')
const yaService = require('../service/ya-service')

class UserController {
    async getMessage(req, res, next) {
        try {
            const { name, options } = req.body
            const message = await yaService.getMessage(name, options);
            return res.json({ message });
        } catch (e) {
            next(e);
        }
    }
    async getReview(req, res, next){
        try {
            const { stocks, orders, supply } = req.body
            const message = await yaService.getReview(stocks, orders, supply)
            return res.json({ message });
        } catch (e) {
            next(e);
        }
    }
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка валидации', errors.array()))
            }
            const { email, password } = req.body
            const userData = await userService.registration(email, password)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            res.cookie('Client-Id', userData.secretId)
            res.cookie('API-Key', userData.secretKey)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body
            const userData = await userService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e)
        }
    }
    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e)
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            next(e)
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e)
        }
    }
    async updateSecret(req, res, next) {
        try {
            const { userId, secretId, secretKey } = req.body
            const user = await userService.updateSecret(userId, secretId, secretKey);
            return res.json(user);
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()