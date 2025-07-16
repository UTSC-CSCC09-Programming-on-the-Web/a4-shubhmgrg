/* global meact */
/* eslint-disable-next-line no-unused-vars */
let apiService = (function () {
  "use strict";
  const [auth, getAuth, setAuth] = meact.useState(null);

  let module = {};

  module.addImage = function (title, author, picture) {
    let formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("picture", picture);

    return fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: getAuth(),
      },
      body: formData,
    });
  };

  module.deleteImage = function (imageId) {
    return fetch("/api/images/" + imageId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(),
      },
    });
  };

  module.getLength = async function (userId) {
    return fetch(`/api/users/${userId}/images/length`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  };

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    let comment = {
      imageId: imageId,
      content: content,
      author: author,
    };

    return fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(),
      },
      body: JSON.stringify(comment),
    });
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch("/api/comments/" + commentId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(),
      },
    });
  };

  module.getImage = async function (userId, cursor = null, direction = "desc") {
    let link = `/api/images/${userId}?direction=` + direction;
    if (cursor) {
      link += "&cursor=" + cursor;
    }

    return fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  module.getComments = function (cursor, imageId) {
    let link = `/api/images/${imageId}/comments`;
    if (cursor) {
      link += "?cursor=" + cursor;
    }
    return fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(),
      },
    });
  };

  module.login = function (username, password) {
    let user = {
      username: username,
      password: password,
    };

    return fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }).then((response) => {
      if (response.ok) {
        return response.json().then((data) => {
          setAuth("Bearer " + data.accessToken);
          return data;
        });
      } else {
        return response.json().then((error) => {
          throw new Error(error.Error);
        });
      }
    });
  };
  module.signup = function (username, password) {
    let user = {
      username: username,
      password: password,
    };

    return fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then((error) => {
          throw new Error(error.Error);
        });
      }
    });
  };

  module.getUser = function () {
    if (!auth) {
      return Promise.reject(new Error("Please log in before proceeding."));
    }

    // console.log(getAuth());
    return fetch("/api/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(),
      },
    }).catch(() => {
      return;
    });
  };

  module.signout = function () {
    setAuth(null);
  };

  module.getGalleries = function (offset, limit) {
    offset = offset || 0;
    limit = limit || 10;

    return fetch(`/api/users/galleries?offset=${offset}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  };

  return module;
})();

/* eslint-enable-next-line no-unused-vars */
