import mongoose from 'mongoose';

const UserInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

export default mongoose.model('UserInfo', UserInfoSchema);