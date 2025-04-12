import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="h-full flex items-center justify-center bg-grey">
      <div className="flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-600 text-4xl">Page not found</p>
        <div
          className="bg-black text-grey px-6 py-2 rounded-3xl text-base cursor-pointer hover:bg-slate-950 transition-all ease-in-out duration-200"
          onClick={() => {
            navigate("/");
          }}
        >
          Go back to Homepage
        </div>
      </div>
    </div>
  );
};

export default NotFound;
