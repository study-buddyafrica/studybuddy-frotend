import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <>
      <div className="flex h-screen justify-center items-center flex-col">
        <div>
          <img src="./images/404.gif" className="max-w-full h-auto" alt="404" />
        </div>
        {/* Go Home Button */}
        <div>
          <Link to="/">
            <button className="bg-[#02E9FB] font-josefin hover:text-[#28231d] text-white py-2 px-8 rounded">
              Let's Go Home
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFound;
