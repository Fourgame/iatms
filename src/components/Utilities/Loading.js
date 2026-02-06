const Loading = () => {
  return (
    <div className="overlay">
      <div className="position-absolute top-50 start-50 translate-middle text-center">
        <span className="spinner-border text-primary" role="status"></span>
        <div className="fw-semibold">Loading ...</div>
      </div>
    </div>
  );
};

export default Loading;
