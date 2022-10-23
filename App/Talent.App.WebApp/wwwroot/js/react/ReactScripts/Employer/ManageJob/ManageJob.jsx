import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Header, Grid, Button, Card, Label, } from 'semantic-ui-react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom'

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            showActive: '',
            showExpired: '',
            showUnexpired: '',
            showClosed: '',
            showDraft: '',  
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        //your functions go here
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });
        this.loadData();
         // this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)
        
        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
       // your ajax call and other logic goes here
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: 'GET',
            data: {

                activePage: this.state.activePage,
                sortbyDate: this.state.sortBy.date,
                showActive: this.state.filter.showActive,
                showClosed: this.state.filter.showClosed,
                showDraft: this.state.filter.showDraft,
                showExpired: this.state.filter.showExpired,
                showUnexpired: this.state.filter.showUnexpired,
            },
            contentType: "application/json",
            dataType: 'json',
            success: function (res) {
                this.setState({ loadJobs: res.myJobs });


            }.bind(this)

        })
    }
    closeData(jobId) {
        var link = 'http://localhost:51689/listing/listing/closeJob';
        var cookies = Cookies.get('talentAuthToken');
        // your ajax call and other logic goes here

        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: 'POST',
            contentType: "application/json",

            dataType: 'json',
            data: JSON.stringify(jobId),
            success: function (res) {
                if (res.success) {
                    TalentUtil.notification.show(res.message, "success", null, null);

                }
                else {
                    TalentUtil.notification.show(res.message, "error", null, null);
                }
            }.bind(this),
            error: function (res) {
                TalentUtil.notification.show("Error while updating details", "error", null, null);
            }.bind(this)

        })
    }
    close(jobId) {
        const jobsLoad = this.state.loadJobs;
        this.closeData(jobId);
        this.setState({ loadJobs: [...jobsLoad.filter(x => x.id !== jobId)] })

    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    render() {
        const data = this.state.loadJobs;

        const options = [
            {
                key: 'desc',
                text: 'Newest First',
                value: 'desc',
                content: 'Newest First',
            }
        ]
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">

                    <h3> List of Jobs </h3>
                    <Header as='h5'>
                        <Icon name='filter' />
                        <Header.Content>
                            Filter: Choose filter{' '}
                            <Dropdown
                                inline
                            />
                            <Icon name='calendar alternate outline' />
                            <span>
                                Sort By Date{' '}
                                <Dropdown
                                    inline
                                    options={options}
                                    defaultValue={options[0].value}
                                />
                            </span>
                        </Header.Content>
                    </Header>
                    <br /><br />

                    <Card.Group>

                        {data.map(d => (
                            <Card key={d.id}>
                                <Card.Content>
                                    <Card.Header>{d.title}</Card.Header>
                                    <Label color='black' ribbon='right'>
                                        <Icon name='user outline' />
                                        {d.noOfSuggestions}
                                    </Label>
                                    <Card.Meta>{d.location.city},{d.location.country}</Card.Meta>
                                    <Card.Description>
                                        We have a position for <strong>{d.title}</strong>
                                        <br /><br />
                                        <br /><br />
                                    </Card.Description>
                                </Card.Content>
                                <Segment clearing>
                                    <Button color='red' className="mini ui button" floated='left'>expired</Button>
                                    <Button basic color='blue' data-tooltip="remove job" data-position="top right" className="mini ui button" floated='right' onClick={() => this.close(d.id)}>Close</Button>
                                    {/*<Button basic color='blue' className="mini ui button" floated='right' onClick={() => this.edit(d.id)}>Edit</Button>*/}
                                    <Link to={{ pathname: `/PostJob`, state: { id: d.id } }}>
                                        <Button basic color='blue' className="mini ui button" data-tooltip="edit job" data-position="top right" floated='right'>Edit</Button>
                                    </Link>
                                    <Button basic color='blue' className="mini ui button" floated='right'>Copy</Button>


                                </Segment>
                            </Card>
                        ))}
                    </Card.Group>
                    <br /><br />
                    <br /><br />
                    <Grid columns={3} >
                        <Grid.Row>
                            <Grid.Column >
                            </Grid.Column>
                            <Grid.Column verticalAlign='middle'>
                                <Pagination defaultActivePage={1} totalPages={1} />
                            </Grid.Column>
                            <Grid.Column>
                            </Grid.Column>
                        </Grid.Row>
                        <br /><br />
                        <br /><br />
                    </Grid>
                </div>
            </BodyWrapper>
        )
    }
}