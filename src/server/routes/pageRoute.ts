import express from 'express';
import PageController from '../controllers/pageController';

const pageRoute = express.Router();

pageRoute.get('/:pageId', PageController.getPage, (req, res) => {
  res.status(200).json(res.locals.page)
});

pageRoute.post('/', PageController.postPage, (req, res) => {
  res.status(200).json(res.locals.page)
});

pageRoute.delete('/:pageId', PageController.deletePage, (req, res) => {
  res.status(200).json(res.locals.page)
});

export default pageRoute;