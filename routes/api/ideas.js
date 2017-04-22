var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Idea = mongoose.model('Idea');
var User = mongoose.model('User');
var auth = require('../auth');

router.param('idea', function(req, res, next, slug) {
  Idea.findOne({ slug: slug})
    .populate('author')
    .then(function (idea) {
      if (!idea) { return res.sendStatus(404); }

      req.idea = idea;

      return next();
    }).catch(next);
});

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.sendStatus(404); }

    req.comment = comment;

    return next();
  }).catch(next);
});

router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  if( typeof req.query.category !== 'undefined' ){
    query.categoryList = {"$in" : [req.query.category]};
  }

  Promise.all([
    req.query.author ? User.findOne({username: req.query.author}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var author = results[0];
    var favoriter = results[1];

    if(author){
      query.author = author._id;
    }

    if(favoriter){
      query._id = {$in: favoriter.favorites};
    } else if(req.query.favorited){
      query._id = {$in: []};
    }

    return Promise.all([
      Idea.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      Idea.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var ideas = results[0];
      var ideasCount = results[1];
      var user = results[2];

      return res.json({
        ideas: ideas.map(function(idea){
          return idea.toJSONFor(user);
        }),
        ideasCount: ideasCount
      });
    });
  }).catch(next);
});

router.get('/feed', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    Promise.all([
      Idea.find({ author: {$in: user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
      Idea.count({ author: {$in: user.following}})
    ]).then(function(results){
      var ideas = results[0];
      var ideasCount = results[1];

      return res.json({
        ideas: ideas.map(function(idea){
          return idea.toJSONFor(user);
        }),
        ideasCount: ideasCount
      });
    }).catch(next);
  });
});

router.get('/:idea', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.idea.populate('author').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({idea: req.idea.toJSONFor(user)});
  }).catch(next);
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var idea = new Idea(req.body.idea);

    idea.author = user;

    return idea.save().then(function(){
      console.log(idea.author);
      return res.json({idea: idea.toJSONFor(user)});
    });
  }).catch(next);
});

router.put('/:idea', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.idea.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.idea.title !== 'undefined'){
        req.idea.title = req.body.idea.title;
      }

      if(typeof req.body.idea.description !== 'undefined'){
        req.idea.description = req.body.idea.description;
      }

      if(typeof req.body.idea.body !== 'undefined'){
        req.idea.body = req.body.idea.body;
      }

      req.idea.save().then(function(idea){
        return res.json({idea: idea.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

router.delete('/:idea', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(){
    if(req.idea.author.toString() === req.payload.id.toString()){
      return req.idea.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
});

router.post('/:idea/favorite', auth.required, function(req, res, next) {
  var ideaId = req.idea._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.favorite(ideaId).then(function(){
      return req.idea.updateFavoriteCount().then(function(idea){
        return res.json({idea: idea.toJSONFor(user)});
      });
    });
  }).catch(next);
});

router.delete('/:idea/favorite', auth.required, function(req, res, next) {
  var ideaId = req.idea._id;

  User.findById(req.payload.id).then(function (user){
    if (!user) { return res.sendStatus(401); }

    return user.unfavorite(ideaId).then(function(){
      return req.idea.updateFavoriteCount().then(function(idea){
        return res.json({idea: idea.toJSONFor(user)});
      });
    });
  }).catch(next);
});

router.get('/:idea/comments', auth.optional, function(req, res, next){
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
    return req.idea.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function(idea) {
      return res.json({comments: req.idea.comments.map(function(comment){
        return comment.toJSONFor(user);
      })});
    });
  }).catch(next);
});

router.post('/:idea/comments', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    var comment = new Comment(req.body.comment);
    comment.idea = req.idea;
    comment.author = user;

    return comment.save().then(function(){
      req.idea.comments.push(comment);

      return req.idea.save().then(function(idea) {
        res.json({comment: comment.toJSONFor(user)});
      });
    });
  }).catch(next);
});

router.delete('/:idea/comments/:comment', auth.required, function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
    req.idea.comments.remove(req.comment._id);
    req.idea.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;