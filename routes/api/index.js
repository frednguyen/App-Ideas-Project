var router = require('express').Router();

router.use('/', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/ideas', require('./ideas'));
router.use('/categories', require('./categories'));

//mongoose error handler
router.use(function(err, req, res, next){
	if(err.name === 'ValidationError'){
		return res.status(422).json({
			errors: Object.keys(err.errors).reduce(function(errors, key){
				errors[key] = err.errors[key].message;

				return errors;

			}, {})
		});
	}
	return errors;
});

module.exports = router;
