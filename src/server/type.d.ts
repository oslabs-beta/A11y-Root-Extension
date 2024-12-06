import { Request, Response, NextFunction } from 'express';

export type ServerError = {
  log: string;
  status?: number;
  message: { err: string };
  success: boolean;
};

export type userController = {
  getUser: (req: Request, res: Response, next: NextFunction) => void;
  postUser: (req: Request, res: Response, next: NextFunction) => void;
  updateUser: (req: Request, res: Response, next: NextFunction) => void;
  deleteUser: (req: Request, res: Response, next: NextFunction) => void;
}

export type projectController = {
  getProject: (req: Request, res: Response, next: NextFunction) => void;
  postProject: (req: Request, res: Response, next: NextFunction) => void;
  updateProject: (req: Request, res: Response, next: NextFunction) => void;
  deleteProject: (req: Request, res: Response, next: NextFunction) => void;
}

export type pageController = {
  getPage: (req: Request, res: Response, next: NextFunction) => void;
  postPage: (req: Request, res: Response, next: NextFunction) => void;
  updatePage: (req: Request, res: Response, next: NextFunction) => void;
  deletePage: (req: Request, res: Response, next: NextFunction) => void;
}
