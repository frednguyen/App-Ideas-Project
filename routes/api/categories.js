var router = require('express').Router();
var mongoose = require('mongoose');
var Idea = mongoose.model('Idea');

router.get('/', function(req, res, next) {
  Idea.find().distinct('categoryList').then(function(categories){
    return res.json({categories: categories});
  }).catch(next);
});

module.exports = router;