const Loading = () => {
  return (
    <div className="overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.7)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="text-center">
        <span className="spinner-border text-primary" role="status"></span>
        <div className="fw-semibold">Loading ...</div>
      </div>
    </div>
  );
};

export default Loading;
