import { Slide, ToastContainer, toast } from "react-toastify";

export const noticeShowAxiosError = (error, message = "") => {
  if (error.response) {
    if (error.response.status === 403) {
      if (message === "") toast.error("Access Denied.");
      else toast.error(message);
    } else if (error.response.status === 500) {
      if (message === "")
        toast.error("Service API Error, please contact IT Administrator.");
      else toast.error(message);
    } else if (error.response.status === 400) {
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.request.responseType == "blob") {
        error.response.data.text().then((text) => {
          const _msg = JSON.parse(text);
          if (_msg.message) toast.error(_msg.message);
          else {
            const err = Object.entries(_msg.errors).map(([name, obj]) => [
              name,
              ...obj,
            ]);
            let msg = "";
            err.forEach((element) => {
              msg += element[1] + "\n";
            });
            toast.error(msg);
          }
        });
      } else if (message) {
        toast.error(message);
      } else {
        const err = Object.entries(error.response.data.errors).map(
          ([name, obj]) => [name, ...obj]
        );
        let msg = "";
        err.forEach((element) => {
          msg += element[1] + "\n";
        });
        toast.error(msg);
      }
    } else if (error.response.status !== 401) {
      toast.error("Error by response code: " + error.response.status);
    }
  } else {
    toast.error(message);
  }
};

export const noticeShowMessage = (message = "", isError = false) => {
  if (isError) toast.error(message);
  else toast.success(message);
};

export const noticeShowWarning = (message = "") => {
  toast.warning(message);
};

const Notification = () => {
  return (
    <div>
      <ToastContainer
        transition={Slide}
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Notification;
