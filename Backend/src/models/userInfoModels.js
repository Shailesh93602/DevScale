import mongoose from 'mongoose';

const UserInfoSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    whatsapp: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    }
});

export default mongoose.model('UserInfo', UserInfoSchema);