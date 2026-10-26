
import React from "react";

export default function Preloader() {
  return (
    <div
      className="global-preloader"
      role="status"
      aria-label="Loading Market Hub"
    >
      <div className="preloader-content">
        <div className="preloader-logo">
          <span className="preloader-logo-letter">M</span>
        </div>

        <h1 className="preloader-title">Market Hub</h1>

        <p className="preloader-subtitle">
          Insights that move your business forward
        </p>

        <div className="preloader-track">
          <div className="preloader-progress" />
        </div>

        <span className="preloader-loading-text">
          Loading your experience...
        </span>
      </div>
    </div>
  );
}
