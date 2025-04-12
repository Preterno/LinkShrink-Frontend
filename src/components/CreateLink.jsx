import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "./QRCode";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Loader from "./common/Loader";

const CreateLinkSchema = Yup.object().shape({
  originalUrl: Yup.string()
    .url("Please enter a valid URL")
    .required("URL is required"),
  customAlias: Yup.string()
    .matches(
      /^[a-zA-Z0-9_-]*$/,
      "Only alphanumeric characters, underscores and dashes are allowed"
    )
    .max(50, "Custom alias cannot be more than 50 characters"),
  expiresAt: Yup.date()
    .min(new Date(), "Expiration date must be in the future")
    .nullable(),
});

const CreateLink = () => {
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${base_url}/api/links`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCreatedLink(res.data);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create link");
    } finally {
      setCreating(false);
      setSubmitting(false);
    }
  };

  const openQRModal = (link) => {
    setSelectedLink(link);
    console.log(selectedLink + "Hi");
    setShowQRModal(true);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {createdLink && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 max-w-md">
          <div className="flex justify-between items-center gap-7">
            <div>
              <p className="font-bold">Link created successfully!</p>
              <p className="text-sm mt-1">
                Shortened URL:
                <a
                  href={`${base_url}/${createdLink.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  {`${base_url}/${createdLink.shortCode}`}
                </a>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => openQRModal(createdLink.shortCode)}
                className="text-blue-600 hover:text-blue-900 text-2xl cursor-pointer"
                title="Show QR Code"
              >
                <i className="bi bi-qr-code"></i>
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
              >
                View All Links
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-lg">
          <p>{error}</p>
        </div>
      )}

      <Formik
        initialValues={{
          originalUrl: "",
          customAlias: "",
          expiresAt: "",
        }}
        validationSchema={CreateLinkSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <div className="w-full max-w-md p-8 py-12 pb-13 bg-white rounded-2xl shadow-xl hover:shadow-2xl max-sm:max-w-xs max-sm:px-5">
            <h1 className="text-3xl font-bold text-center mb-8">
              Create New Link
            </h1>
            <Form>
              <div className="mb-6">
                <label
                  htmlFor="originalUrl"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  URL to Shorten
                </label>
                <Field
                  type="text"
                  name="originalUrl"
                  id="originalUrl"
                  placeholder="https://example.com/very/long/url"
                  className="bg-grey rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="originalUrl"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="customAlias"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Custom Alias (Optional)
                </label>
                <Field
                  type="text"
                  name="customAlias"
                  id="customAlias"
                  placeholder="my-custom-link"
                  className="bg-grey rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="customAlias"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to generate a random short code
                </p>
              </div>

              <div className="mb-7">
                <label
                  htmlFor="expiresAt"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Expiration Date (Optional)
                </label>
                <Field
                  type="datetime-local"
                  name="expiresAt"
                  id="expiresAt"
                  className="bg-grey rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="expiresAt"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for no expiration
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting || creating}
                  className={`w-full py-3 px-4 bg-black text-grey text-xl cursor-pointer font-medium rounded-md ${
                    !isSubmitting &&
                    "hover:bg-dark-grey transition-all ease-in-out duration-200"
                  } disabled:opacity-50`}
                >
                  {creating ? <Loader /> : "Create Link"}
                </button>
              </div>
            </Form>
          </div>
        )}
      </Formik>
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                QR Code for {selectedLink}
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <QRCode url={`${base_url}/${selectedLink}`} size={250} />
              <p className="mt-4 text-base text-center break-all">
                {`${base_url}/${selectedLink}`}
              </p>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    const canvas = document.querySelector(
                      ".qrcode-container canvas"
                    );
                    if (canvas) {
                      const link = document.createElement("a");
                      link.download = `qrcode-${selectedLink}.png`;
                      link.href = canvas.toDataURL("image/png");
                      link.click();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLink;
