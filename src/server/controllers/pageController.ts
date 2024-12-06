import PageModel from '../models/pageModel';
import { pageController } from '../type';

const PageController = {} as pageController;

PageController.getPage = async (req, res, next) => {
	const pageId = req.params.pageId;

	PageModel.find({_id: pageId})
	.then((page) => {
		if(!page.length) {
			return res.status(404).send('No page found.');
		}

		res.locals.page = page;
		return next();
	})
	.catch((error) => {
		return next({
			log: `Error in PageController.getPage: ${error}`,
			message: {err: 'An error occurred retrieving the page.'},
			status: 500
	});
	})
}

PageController.postPage = async (req, res, next) => {
	const { projectId, url, pageRole, pageName, tree, skipLink, h1 } = req.body;

	try {
		const page = await PageModel.findOneAndUpdate(
			{ _id: projectId, url: url },
			{ $set: {pageRole, pageName, tree, skipLink, h1} } ,
			{ new: true, upsert: true },
		);

         res.locals.page = page;
        return next();
	} catch(error) {
		return next({
			log: `Error in PageController.postPage: missing required data in request body: ${error}`,
			message: { err: 'Missing data to update existing page.'},
			status: 400
		})
	}
}


PageController.deletePage = async (req, res, next) => {
	const pageId = req.params.pageId;

	PageModel.findOneAndDelete({ _id: pageId })
	.then((page) => {
		if (page === null) {
			return res.status(404).send('No page found.');
		}

		res.locals.page = page;
		return next();
	})
	.catch((err) => {
		return next({
			log: `Error in PageController.deletePage: ERROR: ${err}`,
			message: { err: 'An error occurred while trying to delete the page.' },
			status: 500
		})
	})
}

export default PageController;