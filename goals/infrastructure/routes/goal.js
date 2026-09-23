const express = require('express');
const { body, param } = require('express-validator');

const goalController = require('../../application/controllers/goal');
const auth = require('../../../middleware/auth');
const validateRequest = require('../../../middleware/validateRequest');

const router = express.Router();

router.get('/', auth, goalController.getGoals);

router.get('/budget/', auth, goalController.getCurrentBudgetGoals);

router.get('/:id', auth, param('id').isMongoId(), validateRequest, goalController.getGoal);

router.post(
    '/', 
    auth, 
    [
        body('name').trim().notEmpty(),
        body('type').trim().notEmpty(),
        body('subtype').optional().trim(),
        body('value').isNumeric(),
        body('current').optional().isNumeric(),
        body('objective_date').optional().isISO8601(),
        body('month').optional().trim().notEmpty(),
        body('status').trim().notEmpty(),
        body('created_at').isISO8601()
    ],
    validateRequest,
    goalController.createGoal
);

router.put(
    '/:id',
    auth,
    [
        param('id').isMongoId(),
        body('name').trim().notEmpty(),
        body('type').trim().notEmpty(),
        body('subtype').optional().trim(),
        body('value').isNumeric(),
        body('current').optional().isNumeric(),
        body('objective_date').optional().isISO8601(),
        body('month').optional().trim().notEmpty(),
        body('status').trim().notEmpty()
    ],
    validateRequest,
    goalController.updateGoal
);

module.exports = router;
