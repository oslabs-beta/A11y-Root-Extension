import express from 'express';
import ProjectController from '../controllers/projectController';

const projectRoute = express.Router();

projectRoute.get('/:projectId', ProjectController.getProject, (req, res)=> {
    res.status(200).json(res.locals.project);
});

//endpoint no longer behaves as expected due to changes to the middleware
// projectRoute.post('/', ProjectController.postProject, (req, res)=> {
//     res.status(200).json(res.locals.project);
// });

//endpoint no longer behaves as expected due to changes to the middleware
// projectRoute.patch('/', ProjectController.updateProject, (req, res)=> {
//   res.status(200).json(res.locals.project);
// });

projectRoute.delete('/:projectId', ProjectController.deleteProject, (req, res)=> {
    res.status(200).json(res.locals);
});

export default projectRoute;