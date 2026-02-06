import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const { isLoggedIn: isLogin } = useSelector((state) => state.auth);
  const isHome =
    useLocation().pathname.substring(1).toLowerCase() === "home" ? true : false;
  const pathname = useLocation().pathname;

  const pathSegments = pathname
    .substring(1)
    .split("/")
    .filter((segment) => segment && !segment.includes("="))
    .map((segment) => segment.replace(/-/g, " ").toUpperCase());

  const lists = pathSegments.map((item, i) => {
    const isLast = i === pathSegments.length - 1;
    return (
      <li
        key={item}
        className={`breadcrumb-item${isLast ? "" : " active"}`}
        aria-current={isLast ? undefined : "page"}
      >
        {item}
      </li>
    );
  });

  return (
    isLogin &&
    !isHome && (
      <div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">{lists}</ol>
        </nav>
      </div>
    )
  );
};

export default Breadcrumb;
