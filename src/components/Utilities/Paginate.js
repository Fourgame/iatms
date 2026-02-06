import React from "react";
import Pagination from "react-bootstrap/Pagination";

export function getPageList(lists, currentPage) {
  const max = process.env.REACT_APP_MAX_ROW;
  const start = max * (currentPage - 1);
  const end =
    max * currentPage < lists.length ? max * currentPage : lists.length;
  return lists.slice(start, end);
}
export function getPageCurrent(cPage, currentPage, rowCount) {
  let page = 1;
  let current = currentPage ? currentPage : 1;

  if (cPage.indexOf("First") >= 0) page = 1;
  else if (cPage.indexOf("Previous") >= 0) page = current - 1;
  else if (cPage.indexOf("Next") >= 0) page = current + 1;
  else if (cPage.indexOf("Last") >= 0)
    page = Math.ceil(rowCount / process.env.REACT_APP_MAX_ROW);
  else page = parseInt(cPage);

  return page;
}

const Paginate = (props) => {
  const currentPage = parseInt(props.currentPage);
  const maxPage = parseInt(props.maxPage);
  const maxPageDisplay = 5;

  let items = [];
  let i = 1;
  let move =
    currentPage - 2 <= 0
      ? 1
      : maxPage - currentPage < 2
      ? maxPage - maxPageDisplay + 1
      : currentPage - 2;
  move = move <= 0 ? 1 : move;

  for (let number = move; number <= maxPage && i <= maxPageDisplay; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={(e) => props.pageChange(e)}
      >
        {number}
      </Pagination.Item>
    );
    i++;
  }
  return (
    <div>
      {maxPage <= 5 && (
        <Pagination size="sm" className="justify-content-center m-2">
          {currentPage > 1 && (
            <Pagination.Prev onClick={(e) => props.pageChange(e)}>
              Previous
            </Pagination.Prev>
          )}

          {maxPage <= 5 && items}

          {maxPage > currentPage && (
            <Pagination.Next onClick={(e) => props.pageChange(e)}>
              Next
            </Pagination.Next>
          )}
        </Pagination>
      )}

      {maxPage > 5 && (
        <Pagination size="sm" className="justify-content-center m-2">
          {currentPage > 1 && (
            <Pagination.First onClick={(e) => props.pageChange(e)}>
              First
            </Pagination.First>
          )}
          {currentPage > 1 && (
            <Pagination.Prev onClick={(e) => props.pageChange(e)}>
              Previous
            </Pagination.Prev>
          )}
          {currentPage - 3 > 0 && <Pagination.Ellipsis disabled />}

          {items}

          {maxPage - currentPage > 2 && <Pagination.Ellipsis disabled />}
          {maxPage > currentPage && (
            <Pagination.Next onClick={(e) => props.pageChange(e)}>
              Next
            </Pagination.Next>
          )}
          {maxPage !== currentPage && (
            <Pagination.Last onClick={(e) => props.pageChange(e)}>
              Last
            </Pagination.Last>
          )}
        </Pagination>
      )}
    </div>
  );
};

export default Paginate;
