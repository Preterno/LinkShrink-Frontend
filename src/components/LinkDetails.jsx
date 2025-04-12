import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Loader from "./common/Loader";
import showToast from "./common/Toast";
import QRCode from "./QRCode";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LinkDetails = () => {
  const { id } = useParams();
  const [link, setLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const base_url = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [linkRes, analyticsRes] = await Promise.all([
          axios.get(`${base_url}/api/links`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${base_url}/api/links/${id}/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const linkData = linkRes.data.find((l) => l._id === id);
        if (!linkData) {
          throw new Error("Link not found");
        }

        setLink(linkData);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch link details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Loader />;

  if (error || !link) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Link not found"}</p>
        <RouterLink
          to="/"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Back to Dashboard
        </RouterLink>
      </div>
    );
  }

  const timeSeriesData = {
    labels: analytics?.clicksByDay
      ? Object.keys(analytics.clicksByDay).sort()
      : [],
    datasets: [
      {
        label: "Clicks",
        data: analytics?.clicksByDay
          ? Object.keys(analytics.clicksByDay)
              .sort()
              .map((date) => analytics.clicksByDay[date])
          : [],
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  const deviceData = {
    labels: analytics?.deviceStats ? Object.keys(analytics.deviceStats) : [],
    datasets: [
      {
        data: analytics?.deviceStats
          ? Object.values(analytics.deviceStats)
          : [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const browserData = {
    labels: analytics?.browserStats ? Object.keys(analytics.browserStats) : [],
    datasets: [
      {
        data: analytics?.browserStats
          ? Object.values(analytics.browserStats)
          : [],
        backgroundColor: [
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const shortUrl = `${base_url}/${link.shortCode}`;

  return (
    <div className="w-full h-full py-10 flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">Link Details</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer flex items-center"
                >
                  <i className="bi bi-qr-code mr-2"></i> Show QR
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shortUrl);
                    showToast("Link copied to clipboard!", { type: "info" });
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer flex items-center"
                >
                  <i className="bi bi-clipboard mr-2"></i> Copy Link
                </button>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    isExpired(link.expiresAt)
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isExpired(link.expiresAt) ? "Expired" : "Active"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Original URL
              </p>
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {link.originalUrl}
              </a>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Shortened URL
              </p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {shortUrl}
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Created On
                </p>
                <p>{new Date(link.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Expires On
                </p>
                <p>{formatDate(link.expiresAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6">
              Performance Overview
            </h2>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600">
                    {analytics?.totalClicks || 0}
                  </p>
                  <p className="text-gray-500 mt-2">Total Clicks</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Clicks Over Time</h3>
            {timeSeriesData.labels.length > 0 ? (
              <div className="h-64">
                <Line data={timeSeriesData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
                No click data available yet
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-medium mb-4">Devices</h3>
            {analytics?.deviceStats &&
            Object.values(analytics.deviceStats).some((val) => val > 0) ? (
              <div className="h-64">
                <Pie data={deviceData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                No device data available yet
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-medium mb-4">Browsers</h3>
            {analytics?.browserStats &&
            Object.values(analytics.browserStats).some((val) => val > 0) ? (
              <div className="h-64">
                <Pie data={browserData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                No browser data available yet
              </p>
            )}
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">
                QR Code for {link.shortCode}
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <QRCode url={shortUrl} size={250} />
              <p className="mt-4 text-base text-center break-all">{shortUrl}</p>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    const canvas = document.querySelector(
                      ".qrcode-container canvas"
                    );
                    if (canvas) {
                      const link = document.createElement("a");
                      link.download = `qrcode-${link.shortCode}.png`;
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

export default LinkDetails;
