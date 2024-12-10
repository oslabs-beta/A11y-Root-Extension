import express from 'express';
import PageController from '../controllers/pageController';
import ProjectController from '../controllers/projectController';
import UserController from '../controllers/userController';

const pageRoute = express.Router();

pageRoute.get('/:pageId', PageController.getPage, (req, res) => {
  res.status(200).json(res.locals.page);
});

//create/find project based on projectName and user
//update user to contain the projectId
//create page using the found/created projectId
//update project to contain the pageId
pageRoute.post('/', ProjectController.postProject, UserController.updateUser, PageController.postPage, ProjectController.updateProject, (req, res) => {
  res.status(200).json(res.locals.page);
});

pageRoute.delete('/:pageId', PageController.deletePage, (req, res) => {
  res.status(200).json(res.locals.page);
});

export default pageRoute;