import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "./common/Loader";
import showToast from "./common/Toast";
import QRCode from "./QRCode";

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const base_url = import.meta.env.VITE_API_BASE_URL;

  const [currentPage, setCurrentPage] = useState(1);
  const [linksPerPage] = useState(6);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${base_url}/api/links`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLinks(res.data);
        setFilteredLinks(res.data);
      } catch (err) {
        setError("Failed to fetch links");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  useEffect(() => {
    const results = links.filter(
      (link) =>
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(results);
    setCurrentPage(1);
  }, [searchTerm, links]);

  const deleteLink = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${base_url}/api/links/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLinks(links.filter((link) => link._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete link");
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  // Get current links for pagination
  const indexOfLastLink = currentPage * linksPerPage;
  const indexOfFirstLink = indexOfLastLink - linksPerPage;
  const currentLinks = filteredLinks.slice(indexOfFirstLink, indexOfLastLink);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openQRModal = (link) => {
    setSelectedLink(link);
    setShowQRModal(true);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full items-center justify-center bg-grey">
      <div className="flex flex-col h-full w-fit min-w-6xl p-4">
        <div className="sticky top-0 pt-4 pb-6 z-10">
          <div className="flex justify-between w-full items-center mb-6">
            <h1 className="text-2.5xl font-semibold">Your Links</h1>
            <Link
              to="/create"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-950 transition-all ease-in-out duration-200 cursor-pointer"
            >
              Create New Link
            </Link>
          </div>

          <div className="flex items-center rounded-full w-full my-6 max-w-lg mx-auto shadow-sm bg-white px-4 hover:shadow-md transition-shadow focus-within:shadow-lg">
            <i className="bi bi-search text-2xl text-gray-400 transition-opacity focus-within:opacity-70"></i>
            <input
              type="text"
              placeholder="Search by URL or short code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 px-2 outline-none text-xl text-gray-700 placeholder-gray-500 rounded-r-full focus:opacity-80"
            />
          </div>
        </div>

        <div className="flex-grow">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              {searchTerm ? (
                <p>No links match your search</p>
              ) : (
                <>
                  <p className="mb-4">You haven't created any links yet</p>
                  <Link
                    to="/create"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 cursor-pointer"
                  >
                    Create Your First Link
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-md hover:shadow-xl">
              <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                <thead className="border-b-2 border-[#d4d4d4] text-left text-xl font-medium text-gray-700 uppercase ">
                  <tr>
                    <th className="px-6 py-3 tracking-wider">Original URL</th>
                    <th className="px-6 py-3 tracking-wider">Short URL</th>
                    <th className="px-6 py-3 tracking-wider">Clicks</th>
                    <th className="px-6 py-3 tracking-wider">Created</th>
                    <th className="px-6 py-3 tracking-wider">Status</th>
                    <th className="px-6 py-3 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentLinks.map((link) => (
                    <tr key={link._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-medium text-gray-900 truncate max-w-xs">
                          {link.originalUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`${base_url}/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:underline cursor-pointer"
                        >
                          {`${base_url}/${link.shortCode}`}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base text-gray-900">
                          {link.clicks}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base text-gray-500">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isExpired(link.expiresAt)
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isExpired(link.expiresAt) ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                        <div className="flex space-x-3">
                          <Link
                            to={`/links/${link._id}`}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          >
                            <i className="bi bi-bar-chart"></i>
                          </Link>
                          <button
                            onClick={() => openQRModal(link)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            <i className="bi bi-qr-code"></i>
                          </button>
                          <button
                            onClick={() => {
                              deleteLink(link._id);
                              showToast("Link deletion successful", {
                                type: "success",
                              });
                            }}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredLinks.length > 0 && (
          <div className="mt-6 pb-4 pt-2 sticky bottom-0 bg-[#f3f3f3]">
            <div className="flex justify-center">
              <nav>
                <ul className="flex space-x-2">
                  <li>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md cursor-pointer ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({
                    length: Math.ceil(filteredLinks.length / linksPerPage),
                  }).map((_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-3.5 py-1 rounded-md cursor-pointer ${
                          currentPage === index + 1
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(filteredLinks.length / linksPerPage),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(filteredLinks.length / linksPerPage)
                      }
                      className={`px-3 py-1 rounded-md cursor-pointer ${
                        currentPage ===
                        Math.ceil(filteredLinks.length / linksPerPage)
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {showQRModal && selectedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  QR Code for {selectedLink.shortCode}
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="flex flex-col items-center">
                <QRCode
                  url={`${base_url}/${selectedLink.shortCode}`}
                  size={250}
                />
                <p className="mt-4 text-base text-center break-all">
                  {`${base_url}/${selectedLink.shortCode}`}
                </p>
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      const canvas = document.querySelector(
                        ".qrcode-container canvas"
                      );
                      if (canvas) {
                        const link = document.createElement("a");
                        link.download = `qrcode-${selectedLink.shortCode}.png`;
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
    </div>
  );
};

export default Dashboard;
