var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug'); // package we'll use to auto create URL slugs
var User = mongoose.model('User');

var IdeaSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  category: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

IdeaSchema.plugin(uniqueValidator, {message: 'is already taken'});

IdeaSchema.pre('validate', function(next){
  this.slugify();

  next();
});

IdeaSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

IdeaSchema.methods.updateFavoriteCount = function() {
  var idea = this;

  return User.count({favorites: {$in: [idea._id]}}).then(function(count){
    idea.favoritesCount = count;

    return article.save();
  });
};

IdeaSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    category: this.category,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Idea', IdeaSchema);