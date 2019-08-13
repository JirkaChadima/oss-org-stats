import React, { Component } from 'react';
import {
  Alert,
  Container,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import Dashboard from './components/Dashboard';
import list from './assets/list';

const sortedList = list.sort((a, b) => a.name < b.name ? 1 : -1);

class App extends Component {
  state = {
    datasource: null,
  };

  constructor(props) {
    super(props);
    this.fetchDataSource = this.fetchDataSource.bind(this);
    this.onDataSourceChange = this.onDataSourceChange.bind(this);
  }

  componentDidMount() {
    const { datasource } = this.props;
    if (!datasource) {
      this.fetchDataSource(sortedList[0].link);
    }
  }

  fetchDataSource (link) {
    fetch(`${process.env.PUBLIC_URL}${link}`)
      .then((d) => d.json())
      .then((d) => {
        this.setState({
          datasource: d,
        });
      });
  }

  onDataSourceChange (e) {
    this.fetchDataSource(e.target.value);
  }

  render() {
    const { datasource } = this.state;
    const options = sortedList.map((l) => {
      return (<option key={l.name} value={l.link}>{l.name}</option>);
    });
    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand href="/">GitHub org stats</NavbarBrand>
          <Nav className="ml-auto" navbar>
          <NavItem>
            <Form inline>
              <FormGroup>
                <Label className="mr-sm-2" for="datasource">Source (UTC times)</Label>
                <Input type="select" name="datasource" id="datasource" onChange={this.onDataSourceChange}>
                {options}
                </Input>
              </FormGroup>
            </Form>
            </NavItem>
          </Nav>
        </Navbar>
        <Container className="mt-2">
          {! datasource && (<Alert color="info">Select data source first.</Alert>)}
          {datasource && (<Dashboard datasource={datasource} />)}
        </Container>
      </div>
    );
  }
}

export default App;
