import db from "../config/database.js";

export const createUser = (user, callback) => {
  const query = "INSERT INTO users (username, email, password) VALUES (?)";
  db.query(query, [user], (err, result) => {
    console.log(err);
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

export const findUserByEmail = (email, callback) => {
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result[0]);
  });
};

export const findUserByUsername = (username, callback) => {
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result[0]);
  });
};

export const updateUserPassword = (email, password, callback) => {
  const query = "UPDATE users SET password = ? WHERE email = ?";
  db.query(query, [password, email], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};
