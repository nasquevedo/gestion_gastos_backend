const Goal = require('../../domain/models/goal');

const _es_months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];

exports.getGoals = async (req, res, next) => {
    try {
        const goals = await Goal.find({ creator: req.userId });

        res.status(200).json({ message: 'success', goals });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.getCurrentBudgetGoals = async (req, res, next) => {
    try {
        const date = new Date();
        const month = _es_months[date.getMonth()];
        const goals = await Goal.find({
            month,
            creator: req.userId,
            type: { $in: ['budget', 'saving'] }
        });

        res.status(200).json({ message: 'success', goals });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.getGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, creator: req.userId });

        if (!goal) {
            return res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
        }

        res.status(200).json({ message: 'success', goal });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.createGoal = async (req, res, next) => {
    try {
        const goal = new Goal({ ...req.body, creator: req.userId });
        const result = await goal.save();

        res.status(201).json({ message: 'success', goal: result });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};

exports.updateGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, creator: req.userId });

        if (!goal) {
            return res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
        }

        goal.name = req.body.name;
        goal.type = req.body.type;
        goal.subtype = req.body.subtype;
        goal.status = req.body.status;
        goal.current = req.body.current;
        goal.value = req.body.value;
        goal.objective_date = req.body.objective_date;
        goal.month = req.body.month;

        const result = await goal.save();

        res.status(200).json({ message: 'success', goal: result });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err });
    }
};
