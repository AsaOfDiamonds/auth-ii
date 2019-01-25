import React, { Component } from 'react';
import { Route, NavLink } from "react-router-dom";
import axios from "axios";
import Register from "./components/Register";
import Login from "./components/Login";

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      users: []
    };
  }
  authenticate = () => {
    const endpoint = `${process.env.REACT_APP_API_URL}/api/users`;
    const token = localStorage.getItem('jwt');
    const options = {
      headers: {
        authenticate: token
      }
    };
    if (token) {
      axios.get(endpoint, options)
        .then(res => {
          if (res.status === 200 && res.data) {
            this.setState({ loggedIn: true, users: res.data })
          } else {
            throw new Error();
          }
        })
        .catch(err => {
          this.props.history.push('/login');
        })
    } else {
      // this.props.history.push('/login');
    }
  }
  componentDidMount() {
    this.authenticate();
  }

  signout = () => {
    localStorage.removeItem('jwt');
  };

  render() {
    return (
      <div className="App">
        <header>
          <nav>
            <NavLink to="/signin">Sign in</NavLink>
            &nbsp;|&nbsp;
						<NavLink to="/users">Users</NavLink>
            <button onClick={this.signout}>Sign out</button>
          </nav>
        </header>
          
            <Route path='/signup' component={Register} />
            <Route path='/signin' component={Login} />
            <Route path='/' render={() => {
              return (
                <section>
                  <h2>Users</h2>
                  <div>
                    {this.state.users.map(user => <li key={user.id}>{user.username}</li>)}
                  </div>
                </section>
              )
            }} />
          
        
      </div>
    );
  }  
}


export default App;
