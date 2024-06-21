// models/userInfoModels.js
import db from "../config/database.js";

export const insertUserInfo = (userInfo, callback) => {
  const query = `
    INSERT INTO user_info (user_id, fullName, dob, gender, mobile, whatsapp, address, university, college, branch, semester)
    VALUES (?)
  `;
  const values = [
    userInfo.id,
    userInfo.fullName,
    userInfo.dob,
    userInfo.gender,
    userInfo.mobile,
    userInfo.whatsapp,
    userInfo.address,
    userInfo.university,
    userInfo.college,
    userInfo.branch,
    userInfo.semester,
  ];
  db.query(query, [values], (err, result) => {
    callback(err, result);
  });
};

export const findUserInfoByEmail = (email, callback) => {
  const query = "SELECT * FROM user_info WHERE email = ?";
  db.query(query, [email], (err, result) => {
    callback(err, result[0]);
  });
};

export const updateUserInfoByEmail = (email, userInfo, callback) => {
  const query = "UPDATE user_info SET ? WHERE email = ?";
  db.query(query, [userInfo, email], (err, result) => {
    callback(err, result);
  });
};
