import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { FaUserCircle } from "react-icons/fa";
import chat from "./svgs/chat.svg";

const Header = ({ setIsChatsOpen }) => {
  const { user, logout } = useContext(UserContext);
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserDetails(user);
    }
  }, [user]);

  return (
    <header className="bg-gray-800 mb-3">
      <div className="flex items-center justify-between px-8 py-2">
        <Link to="/" className="flex flex-row items-center">
          <img src="/EchoRealm.svg" className="lg:size-10 size-6" alt="" />
          <h1 className="text-[#fbe0ce] mx-1 text-xl font-semibold">
            EchoRealm
          </h1>
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <img
                src={chat}
                alt="Chat Icon"
                className="size-10"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsChatsOpen((prev) => !prev);
                }}
              />
            </li>

            <li>
              <Link
                to="/profile"
                className="flex border-2 border-white rounded-full"
              >
                {userDetails?.profilePicture ? (
                  <img
                    src={userDetails?.profilePicture}
                    alt="Profile Picture"
                    className="size-8 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="size-8 text-white" />
                )}
              </Link>
            </li>
            <li>
              <button
                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
                onClick={() => {
                  logout();
                  navigate("/signin");
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
