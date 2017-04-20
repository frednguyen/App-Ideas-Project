// Include React
var React = require("react");

const divStyle = {
  backgroundColor: "black", 
  color: "white"
}

var Submission = React.createClass({
  render: function() {
    return (
    <div className="container">
        <div className="jumbotron" style={divStyle}>
            <h3 className="text-center">Coding Project Ideas For Students, By Students</h3>
        </div>
        <div className="row">
            <div className="col-lg-12">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title"><strong>Current Ideas</strong></h3>
                    </div>
                    <div className="panel-body">
                        <table className="table table-hover" id='employee-table'>
                            <thead>
                                <tr>
                                    <th>Coders Name</th>
                                    <th>App Idea Title</th>
                                    <th>Difficulty Level</th>
                                    <th>Up Votes</th>
                                    <th>Down Votes</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
                <form>
                    <div className="form-group">
                        <label for="name-input">Users Name</label>
                        <input className="form-control" id="employee-name-input" type="text"></input>
                    </div>
                    <div className="form-group">
                        <label for="idea-input">App Idea Title</label>
                        <input className="form-control" id="role-input" type="text"> </input>
                    </div>
                    <div className="form-group">
                        <label for="description-input">Description</label>
                        <input className="form-control" id="role-input" type="text"> </input>
                    </div>
                    <div className="form-group">
                        <label for="category-input">Category (Business, Education, Entertainment, Food, Games, Health, Social)</label>
                        <input className="form-control" id="rate-input" type="text"> </input>
                    </div>
                    <div className="form-group">
                        <label for="level-input">Difficulty Level (enter number)</label>
                        <input className="form-control" id="start-input" type="text"> </input>
                    </div>
                    <h6>Difficulty Level 1: Low - App should run in the browser and feature dynamically updated HTML powered by JavaScript Code or JQuery </h6>
                    <h6>Difficulty Level 2: Medium - Must use Node and Express Web Server, backed by MySQL Database and Sequelize ORM, with GET and POST routes. </h6>
                    <h6>Difficulty Level 3: High - Same as Level 2 but it may use MongoDB Database with Sequelize or Mongoose ORM.  Must use ReactJS or Angular.  </h6>
                    <h6>All Apps must be deployed to Heroku (with Data).</h6>
                    <button className="btn btn-primary" id="add-employee-btn" type="submit">Submit</button>
                </form>
         </div>
      </div>
    </div>
    );
  }
});

module.exports = Submission;
