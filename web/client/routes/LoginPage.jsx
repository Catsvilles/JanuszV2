import React from 'react';
import { Header, Input, Segment } from "semantic-ui-react";
import { Redirect } from "react-router";
import { fetchInitialData, getInitialData } from "../helpers/initialData";
import Logo from "../components/Logo";
import requestJSON from "../helpers/requestJSON";

export default class LoginPage extends React.Component {
  constructor() {
    super();
    
    this.state = {
      ...getInitialData(),
      password: "",
      wrongPassword: false,
      redirect: null,
    };
  }
  
  async componentDidMount() {
    this.setState({
      ...(await fetchInitialData()),
    });
  }
  
  onSubmit = async ev => {
    ev.preventDefault();
    
    const response = await requestJSON({
      method: "POST",
      data: { password: this.state.password },
    });
    
    if(response.success) {
      this.setState({
        redirect: "/",
      });
    } else {
      this.setState({
        wrongPassword: true,
        password: "",
      });
      if(this.input) this.input.focus();
    }
  };
  
  render() {
    return (
      <div className="LoginPage">
        {this.state.redirect ? <Redirect to={this.state.redirect} push /> : null}
        <Logo />
        <Segment className="loginWrapper">
          <Segment as="form" onSubmit={this.onSubmit} stacked className="form">
            <Header>Prove yourself worthy</Header>
            {this.state.wrongPassword ? <div className="error">Wrong password</div> : null}
            <Input name="password"
                   type="password"
                   value={this.state.password}
                   ref={input => this.input = input}
                   onChange={(ev, { value }) => this.setState({ password: value, wrongPassword: false })}
                   action="Login" />
          </Segment>
        </Segment>
      </div>
    );
  }
}
