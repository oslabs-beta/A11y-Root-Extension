import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  profileUrl: String,
  avatarUrl: String,
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
