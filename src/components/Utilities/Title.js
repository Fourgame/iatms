class Title {
  get_title(title) {
    return title
      ? title + " - " + process.env.REACT_APP_TITLE
      : process.env.REACT_APP_TITLE;
  }
}

const title = new Title();
export default title;
