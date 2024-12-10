import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pageSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Must have projectId!'],
  },
  url: { type: String, required: true },
  tree: { type: String, required: true },
  skipLink: { type: String, required: [true, 'A skip link must be present'] },
  h1: { type: String, required: [true, 'An h1 tag must be present'] },
  tabIndex: {
    type: [String],
    required: [true, 'A tabIndex must be present'],
  },
});

// tabindex

const PageModel = mongoose.model('Page', pageSchema);

export default PageModel;
