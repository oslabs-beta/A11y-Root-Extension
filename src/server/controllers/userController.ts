import path from 'path';
// import { Request, Response, NextFunction } from 'express';

import UserModel from '../models/userModel';
import { userController } from '../type';

const UserController = {} as userController;

UserController.getUser = async (req, res, next) => {  // req: Request, res: Response, next: NextFunction
  const githubId = req.params.githubId;

	UserModel.find({githubId}) // use githubId to find user
		.then((user) => {
			if (!user.length) {
				return res.status(404).send('No user found.');
			}

			res.locals.user = user;
			return next();
		})
		.catch((err) => {
			return next({
				log: `Error in UserController.getUser: ERROR: ${err}`,
				message: { err: 'An error occurred retrieving user info.' },
				status: 500
			});
		})
}

UserController.postUser = async (req, res, next) => {
    //check if required information exists in req.body
    if (!req.body.githubId || !req.body.username || !req.body.profileUrl || !req.body.avatarUrl) {
			return next({
				log: 'Error in UserController.postUser: missing required data in request body',
				message: { err: 'Missing data to create new user.'},
				status: 500
			})
    }

    //construct the newUser
    const newUser = {
			githubId: req.body.githubId,
			username: req.body.username,
			profileUrl: req.body.profileUrl,
			avatarUrl: req.body.avatarUrl,
			projects: []
    }

    //send newUser to DB.
    UserModel.create(newUser)
			.then((user) => {
				res.locals.user = user;
				return next()})
			.catch((err) => {
				return next({
					log: `Error in UserController.postUser: ERROR: ${err}`,
					message: { err: 'An error occurred creating new User.' },
					status: 500
				});
			})
}

//need to test once projectRoute is complete, since we need a valid project object ID in order to update user.projects
UserController.updateUser = async (req, res, next) => {
	const { githubId, projectId } = req.body;

	try {
		const user = await UserModel.findOneAndUpdate(
			{githubId},
			{$push: {projects: projectId}},
      {new: true}
		);

		if (user) {
			res.locals.user = user;
			return next();
		} else {
			return next({
				log: `user not found`,
				message: `user not found in UserController.updateUser`,
				status: 400
			})
		}
	} catch(error) {
		const err = {
			log: `Express error handler caught error in updateUser middleware` + error,
			message: { err: 'An error occurred while updating the user.'},
			status: 500
		}
		return next(err);
	}
}

UserController.deleteUser = async (req, res, next) => {  // req: Request, res: Response, next: NextFunction
  const githubId = req.params.githubId;

	UserModel.findOneAndDelete({githubId}) // use githubId to find user
		.then((user) => {
			if (user === null) {
				return res.status(404).send('No user found.');
			}

			res.locals.user = user;
			return next();
		})
		.catch((err) => {
			return next({
				log: `Error in UserController.deleteUser: ERROR: ${err}`,
				message: { err: 'An error occurred while trying to delete the user.' },
				status: 500
			});
		})
}

export default UserController;