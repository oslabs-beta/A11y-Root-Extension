import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pageSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  url: { type: String, required: true },
  pageRole: { type: String },
  pageName: { type: String },
  tree: { type: String, required: true },
  skipLink: { type: Boolean, required: [true, 'A skip link must be present'] },
  h1: { type: Boolean, required: [true, 'An h1 tag must be present'] },
});

const PageModel = mongoose.model('Page', pageSchema);

export default PageModel;
