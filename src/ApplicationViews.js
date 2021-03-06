import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Box } from 'grommet';
import LandingPage from './components/landingPage/landingPage';
import VolunteerList from './components/Volunteers/VolunteerList';
import AddVolunteer from './components/Volunteers/addvolunteer';
import SingleVolunteerView from './components/Volunteers/SingleVolunterView';
import SingleVolunteerEditForm from './components/Volunteers/SingleVolunteerEditForm';
import api from './modules/apiManager';
import ProjectList from './components/projects/ProjectsList';
import AddProject from './components/projects/AddProject';
import SingleProjectView from './components/projects/SingleProjectView';
import EditSingleProject from './components/projects/EditSingleProject';
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import UserSettings from './components/Users/userSetting';

export default class ApplicationViews extends Component {
	state = {
		volunteers: [],
		organizations: [],
		projects: [],
		categories: [],
		skills: [],
		projectSkills: [],
		volunteersProjects: [],
		volunteersSkills: [],
		hours: []
	};

	getSingleUserbyUsername = (variable) => api.singleByAttribute('organizations', 'username', variable);

	addOrganization = (organization) => {
		return api.post(organization, 'organizations').then(() => {
			return api.all('organizations').then((organizations) => this.setState({ organizations: organizations }));
		});
	};

	addVolunteer = (volunteer) =>
		api
			.post(volunteer, 'volunteers')
			.then(() => api.all('volunteers'))
			.then((volunteers) => this.setState({ volunteers: volunteers }));

	deleteVolunteer = (id) => {
		api.deleteAndList('volunteers', id).then((volunteers) => this.setState({ volunteers: volunteers }));
	};

	updateVolunteer = (editedVolunteerObject) => {
		return api.put('volunteers', editedVolunteerObject).then(() => api.all('volunteers')).then((volunteers) => {
			this.setState({
				volunteers: volunteers
			});
		});
	};

	addVolunteerToProject = (VolProjObject) => {
		return api
			.post(VolProjObject, 'volunteersProjects')
			.then(() => api.all('volunteersProjects'))
			.then((VolProjs) => this.setState({ volunteersProjects: VolProjs }));
	};

	addProject = (project) =>
		api
			.post(project, 'projects')
			.then(() => api.all('projects'))
			.then((projects) => this.setState({ projects: projects }));

	deleteProject = (id) => {
		api.deleteAndList('projects', id).then((projects) => this.setState({ projects: projects }));
	};
	updateProject = (editedProjectObject) => {
		return api.put('projects', editedProjectObject).then(() => api.all('projects')).then((projects) => {
			this.setState({
				projects: projects
			});
		});
	};
	refreshUsers = () =>
		api.all('organizations').then((parsed) => {
			this.setState({ organizations: parsed });
		});
	refreshExpanded = (table, expandedItem, stateLocation) =>
		api.getExpanded(table, expandedItem).then((parsedItems) => this.setState(`{${stateLocation}: ${parsedItems}`));

	VolunteerHoursOnaProject = (volunteerId, projectId) => {
		const hoursOnProject = this.props.hours
			.filter((hours) => hours.volunteerId === volunteerId && hours.projectId === projectId)
			.map((hours) => hours.quantity)
			.reduce((a, b) => a + b, 0);
		return hoursOnProject;
	};
	totalHoursByVolunteer = (volunteerId) => {
		const hoursByVolunteer = this.props.hours
			.filter((hours) => hours.volunteerId === volunteerId)
			.map((hours) => hours.quanity)
			.reduce((a, b) => a + b, 0);
		return hoursByVolunteer;
	};

	componentDidMount() {
		const newState = {};
		api.all('volunteers').then((parsedVolunteers) => {
			newState.volunteers = parsedVolunteers;

			api.all('projects').then((parsedProjects) => {
				newState.projects = parsedProjects;
				api.all('skills').then((parsedSkills) => {
					newState.skills = parsedSkills;
					api.all('projectsSkills').then((parsedPS) => {
						newState.projectSkills = parsedPS;
						api.all('volunteersProjects').then((parsedvolunteersProjects) => {
							newState.volunteersProjects = parsedvolunteersProjects;
							api.all('volunteersSkills').then((parsedvolunteersSkills) => {
								newState.volunteersSkills = parsedvolunteersSkills;
								api.all('hours').then((parsedHours) => {
									newState.hours = parsedHours;
									this.setState(newState);
								});
							});
						});
					});
				});
			});
		});
	}

	render() {
		return (
			<Box direction="row" flex overflow={{ horizontal: 'hidden' }}>
				<Box flex align="center" justify="center">
					<Route
						path="/login"
						render={(props) => {
							return <Login {...props} getUser={this.getSingleUserbyUsername} />;
						}}
					/>
					<Route
						path="/register"
						render={(props) => {
							return (
								<Register
									{...props}
									addUser={this.addOrganization}
									getUser={this.getSingleUserbyUsername}
									refresh={this.refreshUsers}
								/>
							);
						}}
					/>
					<Route
						exact
						path="/"
						render={(props) => {
							return <LandingPage {...props} projects={this.state.projects} />;
						}}
					/>
					<Route
						exact
						path="/volunteers"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return (
									<VolunteerList
										{...props}
										volunteers={this.state.volunteers}
										hours={this.state.hours}
										projects={this.state.projects}
									/>
								);
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						path="/volunteers/add"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return <AddVolunteer {...props} addVolunteer={this.addVolunteer} />;
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						exact
						path="/volunteers/:volunteerId(\d+)"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return (
									<SingleVolunteerView
										{...props}
										delete={this.deleteVolunteer}
										route="volunteers"
										volunteers={this.state.volunteers}
										projects={this.state.projects}
										hours={this.state.hours}
										addToProject={this.addVolunteerToProject}
										refresh={this.refreshExpanded}
									/>
								);
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						path="/volunteers/:volunteerId(\d+)/edit"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return (
									<SingleVolunteerEditForm
										{...props}
										volunteers={this.state.volunteers}
										projects={this.state.projects}
										skills={this.state.skills}
										updateVolunteer={this.updateVolunteer}
										route="volunteers"
									/>
								);
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						exact
						path="/projects"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return (
									<ProjectList
										{...props}
										projects={this.state.projects}
										hours={this.state.hours}
										volunteers={this.state.volunteersProjects}
									/>
								);
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						exact
						path="/projects/:projectId(\d+)"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return (
									<SingleProjectView
										{...props}
										delete={this.deleteProject}
										volunteers={this.state.volunteers}
										projects={this.state.projects}
										hours={this.state.hours}
										addToProject={this.addVolunteerToProject}
										refresh={this.refreshExpanded}
									/>
								);
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						path="/projects/add"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return <AddProject {...props} addProject={this.addProject} />;
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						path="/projects/:projectId(\d+)/edit"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return (
									<EditSingleProject
										{...props}
										projects={this.state.projects}
										skills={this.state.skills}
										updateProject={this.updateProject}
									/>
								);
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>

					<Route
						exact
						path="/settings"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return <UserSettings {...props} skills={this.state.skills} />;
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
					<Route
						path="/profile/edit"
						render={(props) => {
							if (this.props.isAuthenticated()) {
								return null;
							} else {
								return <Redirect to="/login" />;
							}
						}}
					/>
				</Box>
			</Box>
		);
	}
}
