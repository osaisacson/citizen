/*global localStorage */

var React = require('react');
var Link = require('react-router').Link;
// required for ajax calls
var axios = require('axios');
import { withRouter } from 'react-router';

// Bill constructor
//Only show the result of last vote and how my MP voted about that when the //filter is "votedonbymyrep"
var Bill = React.createClass({

  render: function() {
      var result = this.props.resultOfVote || "";
      var resultClass = "result"+result || "";
      var ballot = this.props.ballot || "";
      var ballotClass = "dynamic" + (ballot.substring(0, 2)); 
      
    return (
      <div className="listedItem">
          <Link to={"/bill/" + this.props.billId}><h4>{this.props.billId}  
          { ( this.props.params.filter === "votedonbymyrep" &&  this.props.ballot) ? <h4>status: <span className={resultClass}>{result}</span></h4> : "" }
          { (this.props.params.filter === "votedonbymyrep" &&  this.props.ballot) ?  <h4><span>my representative voted  -</span>  <span className={ballotClass}> {ballot} </span> </h4> : "" } 
        </h4>
        <h5>{this.props.billTitle}</h5>
        </Link>
      </div>
    );
  }
});


// Bills constructor
var Bills = React.createClass({
  getInitialState: function() {
    // set inital state to determine which list of bills is displayed - active by default
    return {
      billList: [],
      repFullName: ""
    };
  },
  componentDidMount: function() {
    this.loadData();
  },
  componentWillMount: function(){
    this.setState({
      repFullName: localStorage.getItem('repFullName')
    });
  },
  componentDidUpdate: function(prevProps) {
    if(prevProps.params.filter !== this.props.params.filter) {
      this.loadData();
    }
  },
  loadData: function() {
    var that = this;
    // set filter as url parameter
    var filter = this.props.params.filter;
    this.setState({loading: true});

    // post filter to server and this.setState({billList: response.data})
    var repName = localStorage.getItem("repName");
    axios.post('/postfilter', {
      filter: filter,
      repName: repName
    })
    .then(function(response) {
      that.setState({billList: response.data, loading: false});
    })
    .catch(function(response) {
      console.log(response, 'response');
    });
  },
  renderBills: function(bill) {
    return (
      <li key={bill.billId}>
        <Bill billTitle={bill.billTitle} billId={bill.billId} resultOfVote={bill.resultOfVote} params={{filter: this.props.params.filter}} ballot={bill.ballot}/>
      </li>
    );
  },
  render: function() {
    return (
      <div>

        <h1>BILLS</h1>
        <h3>What would you do?</h3>
 
        <div className="searchbox">
          <input ref="search" className="searchinput" type="text" name="search" maxLength="20" placeholder="Search for bill by word, eg health, crime..." />
        </div>
        
        <div className="repName">
          {this.props.params.filter === "votedonbymyrep"  ? <p>The below shows the bills your representative, {this.state.repFullName}, has voted on. <span className="dynamicYe">PASSED</span>/<span className="dynamicNo">FAILED</span>/<span className="dynamicDi">TIE</span> indicates the bill's latest status in parliament</p>  : ""} 
        </div>

        <div className="billTags">
          <div><Link activeClassName="active" to="/bills/votedonbymyrep">Rep votes</Link></div>
          <div><Link activeClassName="active" to="/bills/">My votes</Link></div>
          <div><Link activeClassName="active" to="/bills/proposedbymyrep">Rep proposals</Link></div>
          <div><Link activeClassName="active" to="/bills/active">Active</Link></div>
          <div><Link activeClassName="active" to="/bills/all">All</Link></div>
        </div>
          
        <div className="billList">
          {this.state.loading ? <p>Please wait while we find all the Bills...</p> : null}
          <div>
            {this.state.billList.length === 0 ? <p>'We will have more filters coming soon'</p> : this.state.billList.map(this.renderBills)}
          </div>
        </div>
     </div>
    );
  }
});

module.exports = withRouter(Bills);