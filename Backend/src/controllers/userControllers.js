import { getUsersCollection } from '../models/userModels.js';

export const getProfile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const usersCollection = getUsersCollection();
        const user = await usersCollection.findOne({ email: userEmail });
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        res.status(200).json({ success: true, profile: user.profile });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
};

export const updateProfile = async (req, res) => {
    try {
        const userEmail = req.user.email; 
        
        const { profile } = req.body;
        const usersCollection = getUsersCollection();
        const updatedUser = await usersCollection.findOneAndUpdate(
          { email: userEmail },
          { $set: { profile } },
          { returnOriginal: false }
        );
    
        if (!updatedUser.value) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        res.status(200).json({ success: true, profile: updatedUser.value.profile });
      } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
};
