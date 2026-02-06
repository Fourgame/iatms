import React from "react";

const ReportViewer = (props) => {
  return (
    <div className="card mt-3">
      <div className="card-body">
        <iframe
          src={
            process.env.REACT_APP_ENV == "prod"
              ? process.env.REACT_APP_REPORT_URL_PROD
              : process.env.REACT_APP_REPORT_URL_UAT +
                props.report_name +
                "&rs:Embed=true" +
                props.params
          }
          width="100%"
          height={props.height}
        ></iframe>
      </div>
    </div>
  );
};

export default ReportViewer;
