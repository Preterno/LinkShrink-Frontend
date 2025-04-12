import React, { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

const QRCode = ({ url, size = 200 }) => {
  const qrRef = useRef(null);

  useEffect(() => {
    if (qrRef.current && url) {
      QRCodeLib.toCanvas(
        qrRef.current,
        url,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [url, size]);

  return (
    <div className="qrcode-container">
      <canvas ref={qrRef}></canvas>
    </div>
  );
};

export default QRCode;
