import db from "../config/database.js";

export const insertUserInfo = (userInfo, callback) => {
  const query = `
    INSERT INTO user_info (user_id, fullName, dob, gender, mobile, whatsapp, address, university, college, branch, semester)
    VALUES (?)
  `;
  db.query(query, [userInfo], (err, result) => {
    callback(err, result);
  });
};

export const findUserInfoByUserId = (userId, callback) => {
  const query = "SELECT * FROM user_info WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
    callback(err, result[0]);
  });
};

export const updateUserInfoByUserId = (userId, userInfo, callback) => {
  const query = "UPDATE user_info SET ? WHERE user_id = ?";
  db.query(query, [userInfo, userId], (err, result) => {
    callback(err, result);
  });
};
