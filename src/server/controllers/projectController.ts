import ProjectModel from '../models/projectModel';
import { projectController } from '../../types/server.types';

const ProjectController = {} as projectController;

ProjectController.getProject = async (req, res, next) => {
  const projectId = req.params.projectId;

  ProjectModel.find({ _id: projectId })
    .then((project) => {
      if (!project.length) {
        return res.status(404).send('No project found.');
      }
      res.locals.project = project;
      return next();
    })
    .catch((error) => {
      return next({
        log: `Error in ProjectController.getProject: ${error}`,
        message: { err: 'An error occurred retrieving the project.' },
        status: 500,
      });
    });
};

ProjectController.postProject = async (req, res, next) => {
  if (!req.body.userGithubId || !req.body.projectName) {
    return next({
      log: 'Error in ProjectController.postProject: missing required data in request body',
      message: { err: 'Missing data to create new project.' },
      status: 400,
    });
  }

  // const newProject = {
  //   userGithubId: req.body.userGithubId,
  //   projectName: req.body.projectName,
  //   pages: [],
  // };
  try {
    const updatedDate = new Date();
    const project = await ProjectModel.findOneAndUpdate(
      {
        userGithubId: req.body.userGithubId,
        projectName: req.body.projectName,
      },
      { $set: { updatedAt: updatedDate } },
      { new: true, upsert: true }
    );
    res.locals.project = project;
    return next();
  } catch (error) {
    return next({
      log: `Error in ProjectController.postProject: ${error}`,
      merssage: { err: 'An error occurred creating new project.' },
      status: 500,
    });
  }
};

ProjectController.updateProject = async (req, res, next) => {
  const pageId = res.locals.page._id;
  if (req.body.projectName && res.locals.project._id) {
    //update the projectName of the given projectId
    const date = new Date();

    ProjectModel.findOneAndUpdate(
      { _id: res.locals.project._id },
      { $addToSet: { pages: pageId } },
      { new: true }
    )
      .then((project) => {
        res.locals.project = project;
        return next();
      })
      .catch((error) => {
        return next({
          log: `Error in ProjectController.updateProject updating projectName: ${error}`,
          message: { err: 'An error occurred updating project name.' },
          status: 500,
        });
      });
  } else if (req.body.pages && req.body.projectId) {
    //update the pages of the given projectId
    const date = new Date();

    ProjectModel.findOneAndUpdate(
      { _id: req.body.projectId },
      { $set: { pages: req.body.pages, updatedAt: date } },
      { new: true }
    )
      .then((project) => {
        res.locals.project = project;
        return next();
      })
      .catch((error) => {
        return next({
          log: `Error in ProjectController.updateProject updating the pages: ${error}`,
          message: {
            err: 'An error occurred updating pages within the project.',
          },
          status: 500,
        });
      });
  } else {
    //if request body does not contain the required info
    return next({
      log: 'Error in ProjectController.updateProject: missing required data in request body',
      message: { err: 'Missing data to update existing project.' },
      status: 400,
    });
  }
};

//  ‘/projects/:projectId’
ProjectController.deleteProject = async (req, res, next) => {
  const projectId = req.params.projectId;

  ProjectModel.findOneAndDelete({ _id: projectId })
    .then((project) => {
      if (project === null) {
        return res.status(404).send('No project found.');
      }

      res.locals.project = project;
      return next();
    })
    .catch((err) => {
      return next({
        log: `Error in ProjectController.deleteProject: ERROR: ${err}`,
        message: {
          err: 'An error occurred while trying to delete the project.',
        },
        status: 500,
      });
    });
};

export default ProjectController;
