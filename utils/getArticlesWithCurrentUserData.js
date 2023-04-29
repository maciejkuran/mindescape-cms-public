const getArticlesWithCurrentUserData = (articles, users) => {
  return articles.map(article => {
    const foundUser = users.find(({ _id }) => _id.toString() === article.authorId);

    return {
      ...article,
      authorImage: foundUser.image,
      authorName: foundUser.name,
      authorLastName: foundUser.lastName,
    };
  });
};

export default getArticlesWithCurrentUserData;
