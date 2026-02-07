
import { useLocation } from "react-router-dom";
import TokenService from "../../services/token.service";

const Breadcrumb = () => {
  const isLoggedIn = TokenService.getUser();

  const pathname = useLocation().pathname;
  const isHome =
    pathname.toLowerCase() === "" ||
    pathname.toLowerCase() === "/home";
  const pathSegments = pathname
    .substring(1)
    .split("/")
    .filter((segment) => segment && !segment.includes("="))
    .map((segment) => {
      return segment
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    });

  if (!isLoggedIn || isHome || pathSegments.length === 0) {
    return null;
  }

  const lists = pathSegments.map((item, i) => {
    const isLast = i === pathSegments.length - 1;
    return (
      <span key={item}>
        {i > 0 && " / "}
        <span style={isLast ? { fontWeight: 'bold' } : {}}>
          {item}
        </span>
      </span>
    );
  });

  return (

    <div style={{ backgroundColor: '#e9ecef', overflow: 'hidden' }}>
      <div style={{
        backgroundColor: '#dbeaff',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        padding: '10px 15px',
        margin: '20px',
        fontSize: '18px',
        fontWeight: '500',
        color: '#000'
      }}>
        {lists}
      </div>
    </div>

  );
};

export default Breadcrumb;
