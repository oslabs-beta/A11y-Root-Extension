import express from 'express';
import UserController from '../controllers/userController';

const userRoute = express.Router();

userRoute.get('/:userId', UserController.getUser, (req, res) => {
  res.status(200).json(res.locals.user);
});

userRoute.post('/', UserController.postUser, (req, res) => {
  res.status(200).json(res.locals.user);
});

userRoute.patch('/', UserController.updateUser, (req, res) => {
  res.status(200).json(res.locals.user);
});

userRoute.delete('/:githubId', UserController.deleteUser, (req, res) => {
  res.status(200).json(res.locals.user);
});

export default userRoute;
