import express from 'express';
import ProjectController from '../controllers/projectController';

const projectRoute = express.Router();

projectRoute.get('/:projectId', ProjectController.getProject, (req, res)=> {
    res.status(200).json(res.locals.project)
});

projectRoute.post('/', ProjectController.postProject, (req, res)=> {
    res.status(200).json(res.locals.project)
});

projectRoute.patch('/', ProjectController.updateProject, (req, res)=> {
  res.status(200).json(res.locals.project)
});

projectRoute.delete('/:projectId', ProjectController.deleteProject, (req, res)=> {
    res.status(200).json(res.locals)
});

export default projectRoute;