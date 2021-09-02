import React, { Component } from 'react';
import { BrowserRouter as Router, Route, NavLink as RouterNavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import { UserAgentApplication } from 'msal';

import { config } from './Config';
import ErrorMessage from './ErrorMessage';
import { normalizeError, getUserProfile } from './utils/MSUtils';


import '@fortawesome/fontawesome-free/css/all.css';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      error: null,
      isAuthenticated: false,
      user: {}
    };

    this.userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: config.clientId,
        redirectUri: config.redirectUri
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: true
      }
    });
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  async login() {
    try {
      await this.userAgentApplication.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
        });

      const user = await getUserProfile(this.userAgentApplication, config.scopes);
      this.setState({
        isAuthenticated: true,
        user: {
          displayName: user.displayName,
          email: user.mail || user.userPrincipalName
        },
        error: null
      });
    }
    catch (err) {
      this.setState({
        isAuthenticated: false,
        user: {},
        error: normalizeError(err)
      });
    }
  }

  logout() {
    this.userAgentApplication.logout();
  }

  render() {
    let error = null;
    if (this.state.error) {
      error = <ErrorMessage
        message={this.state.error.message}
        debug={this.state.error.debug} />;
    }
    return (
      <Router>
        <div>
         
                  {/* {this.state.isAuthenticated ?
                    (
                     
                    ) :
                    
                  } */}
       
          <Container>
            {error}
            <Route exact path="/"
              render={() =>
                <div >              

                  {this.state.isAuthenticated
                    ? <div>
                      <h4>Welcome {this.state.user.displayName}!</h4>
                      <p>Use the navigation bar at the top of the page to get started.</p>
                    </div>
                    : <img id="login-button" onClick={() => this.login()} src="https://dqcgrsy5v35b9.cloudfront.net/cruiseplanner/assets/img/icons/login-w-icon.png"></img> 
                  }
                </div>
              } />
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;