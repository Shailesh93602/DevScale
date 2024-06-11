"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: "Shailesh Chaudhari",
    email: "shailesh@mrengineers.com",
    bio: "Aspiring software engineer with a passion for coding and technology.",
    profilePicture: "https://via.placeholder.com/150",
    achievements: [
      "Solved 500+ Problems on Code Chef",
      "Institute rank II on GFG",
      "5* in C++ on Hackerrank",
    ],
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/profile", {
          credentials: "include",
        });
        const data = await response.json();
        setUserInfo({ ...userInfo, ...data.userInfo });
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchData();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="bg-light shadow rounded-md p-6">
          <div className="flex items-center space-x-4">
            <img
              src={userInfo.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userInfo.fullName}
                  onChange={handleChange}
                  className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none bg-transparent"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">
                  {userInfo.fullName}
                </h1>
              )}
              <p className="text-gray-700">{userInfo.email}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleChange}
                className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none bg-transparent"
              />
            ) : (
              <p className="mt-2 text-gray-700">{userInfo.bio}</p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Achievements
            </h2>
            <ul className="list-disc ml-5 mt-2 text-gray-700">
              {userInfo.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-light rounded-md shadow hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-green-500 text-light rounded-md shadow hover:bg-green-600"
              >
                Edit Profile
              </button>
            )}
            <p className="text-gray-700">{userInfo.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}
