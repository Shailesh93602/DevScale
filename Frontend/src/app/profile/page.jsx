"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiSave, FiX } from "react-icons/fi";
import styles from "./ProfilePage.module.css";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    whatsapp: "",
    address: "",
    university: "",
    college: "",
    branch: "",
    semester: "",
    email: "",
    bio: "",
    profilePicture: "",
    achievements: [],
  });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:4000/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          let { achievements, ...otherDetails } = data.userInfo;
          if (!achievements) achievements = [];
          setUserInfo({ ...otherDetails, achievements });
        } else toast.error(json.message);
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:4000/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Profile Updated Successfully!");
        setIsEditing(false);
      } else toast.error(data.message);
    } catch (error) {
      console.error("Internal server error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setUserInfo((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className={`bg-white shadow rounded-md p-6 ${styles.profileCard}`}>
        <div className="flex justify-between">
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
            <img
              src={profileImage || userInfo.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer">
                <FiEdit className="text-white text-xl" />
              </div>
            )}
          </label>
          <div className="mt-5">
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={userInfo.fullName}
                onChange={handleChange}
                className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none bg-transparent"
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">
                {userInfo.fullName
                  .split(" ")
                  .filter((name) => name.trim() !== "")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </h1>
            )}
            <p className="text-gray-700">{userInfo.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-blue-900">Bio</h2>
          {isEditing ? (
            <textarea
              name="bio"
              value={userInfo.bio}
              onChange={handleChange}
              className="w-full mt-2 p-2 border text-gray-900 border-gray-300 rounded-md bg-transparent"
            />
          ) : (
            <p className="mt-2 text-gray-700">{userInfo.bio}</p>
          )}
        </div>

        <div
          className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${styles.infoGrid}`}
        >
          <div className={styles.infoSection}>
            <h2 className="text-lg font-semibold text-blue-900">
              Personal Information
            </h2>
            {renderInput(
              "Date of Birth",
              "dob",
              userInfo.dob?.slice(0, 10),
              handleChange,
              isEditing
            )}
            {renderInput(
              "Gender",
              "gender",
              userInfo.gender,
              handleChange,
              isEditing
            )}
            {renderInput(
              "Mobile",
              "mobile",
              userInfo.mobile,
              handleChange,
              isEditing
            )}
            {renderInput(
              "WhatsApp",
              "whatsapp",
              userInfo.whatsapp,
              handleChange,
              isEditing
            )}
            {renderInput(
              "Address",
              "address",
              userInfo.address,
              handleChange,
              isEditing
            )}
          </div>
          <div className={styles.infoSection}>
            <h2 className="text-lg font-semibold text-blue-900">
              Academic Information
            </h2>
            {renderInput(
              "University",
              "university",
              userInfo.university,
              handleChange,
              isEditing
            )}
            {renderInput(
              "College",
              "college",
              userInfo.college,
              handleChange,
              isEditing
            )}
            {renderInput(
              "Branch",
              "branch",
              userInfo.branch,
              handleChange,
              isEditing
            )}
            {renderInput(
              "Semester",
              "semester",
              userInfo.semester,
              handleChange,
              isEditing
            )}
          </div>
        </div>

        <div className={styles.achivementsection}>
          <h2 className="text-lg font-semibold text-blue-900">Achievements</h2>
          {isEditing ? (
            <textarea
              name="achievements"
              value={userInfo.achievements.join("\n")}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "achievements",
                    value: e.target.value.split("\n"),
                  },
                })
              }
              className="w-full mt-2 p-2 border text-gray-900 border-gray-300 rounded-md bg-transparent"
            />
          ) : (
            <ul className="list-disc ml-5 mt-2 text-gray-700">
              {userInfo.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 flex items-center"
              >
                <FiSave className="mr-2" /> Save
              </button>
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 flex items-center"
              >
                <FiX className="mr-2" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 flex items-center"
            >
              <FiEdit className="mr-2" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const renderInput = (label, name, value, onChange, isEditing) => (
  <div className="mt-4">
    <label className="block text-gray-700">{label}</label>
    {isEditing ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full p-2 border text-gray-900 border-gray-300 rounded-md bg-transparent"
      />
    ) : (
      <p className="mt-1 text-gray-700">{value}</p>
    )}
  </div>
);
