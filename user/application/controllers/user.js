const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../../domain/models/user');
const Logged = require('../../domain/models/login');
const Mail = require('../../../shared/domain/models/email');

const toUserResponse = user => ({
    _id: user._id,
    name: user.name,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    admin: user.admin,
    deleted: user.deleted
});

exports.signup = async (req, res, next) => {
    try {
        const { name, lastname, username, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Bad Request', message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name,
            lastname,
            username,
            email,
            password: hashedPassword,
            deleted: false,
            admin: false
        });

        const result = await user.save();

        res.status(201).json({ message: 'User created', user: toUserResponse(result) });
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error while the user was creating',
            err
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid credentials' });
        }

        if (user.deleted) {
            return res.status(400).json({ error: 'Bad Request', message: 'User Deleted' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'JWT secret is not configured'
            });
        }

        const userInfo = toUserResponse(user);
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        const logged = new Logged({
            user: user._id,
            isLogged: true,
            token
        });

        await logged.save();

        res.status(200).json({ message: 'success', token, user: userInfo });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.logout = async (req, res, next) => {
    try {
        await Logged.findOneAndRemove({ token: req.token });

        res.status(200).json({ message: 'success', token: '', isLogged: false });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('+password');

        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }

        user.name = req.body.name;
        user.lastname = req.body.lastname;
        user.username = req.body.username;
        user.email = req.body.email;

        const result = await user.save();

        res.status(200).json({ message: 'success', user: toUserResponse(result) });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Bad Request', message: 'Invalid Password' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({ message: 'success' });
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error updating the password'
        });
    }
};

exports.setup = (req, res, next) => {};

exports.delete = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        }

        user.deleted = true;
        const result = await user.save();

        res.status(200).json({ message: 'success', user: toUserResponse(result) });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.send = async (req, res, next) => {
    try {
        const mail = new Mail({
            to: 'gestion.control.gastos@gmail.com',
            from: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        });

        const result = await mail.save();

        res.status(200).json({ message: 'success', result });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};
