/* global meact, apiService */

(function () {
  "use strict";
  /* eslint-disable no-unused-vars */
  const [length, getLength, setLength] = meact.useState(0);
  const [image, getImage, setImage] = meact.useState(null);
  const [imageCursor, getImageCursor, setImageCursor] = meact.useState(null);
  const [imageLoading, getImageLoading, setImageLoading] = meact.useState(null);
  const [imageError, getImageError, setImageError] = meact.useState(false);
  const [commentsCursor, getCommentsCursor, setCommentsCursor] =
    meact.useState(null);
  const [comments, getComments, setComments] = meact.useState([]);
  const [infiniteLoading, getInfiniteLoading, setInfiniteLoading] =
    meact.useState(null);
  const [commentError, getCommentError, setCommentError] =
    meact.useState(false);
  const [commentLoading, getCommentLoading, setCommentLoading] =
    meact.useState(false);
  const [galleries, getGalleries, setGalleries] = meact.useState([]);
  const [galleryPage, getGalleryPage, setGalleryPage] = meact.useState(0);
  const [user, getUser, setUser] = meact.useState(2);
  const [currentUser, getCurrentUser, setCurrentUser] = meact.useState(null);
  const [isLoggedIn, getIsLoggedIn, setIsLoggedIn] = meact.useState(false);
  const [isGalleryLoading, getIsGalleryLoading, setIsGalleryLoading] =
    meact.useState(false);

  /* eslint-enable no-unused-vars */

  function showGalleries() {
    const galleriesContainer = document.querySelector(".gallery-container");
    galleriesContainer.innerHTML = "";
    getGalleries().forEach((gallery) => {
      const galleryItem = document.createElement("div");
      galleryItem.classList.add("gallery-item");
      galleryItem.innerText = gallery.username + "'s Gallery";
      galleriesContainer.appendChild(galleryItem);
      galleryItem.addEventListener("click", function () {
        setUser(gallery.id);
        document.querySelector(".signup-page").classList.add("hidden-form");
        document.querySelector(".main-body").classList.remove("hidden");
        document.querySelector("#back-btn").classList.remove("hidden");
        document.querySelector(".credits-page").classList.add("hidden");
        document.querySelector(".credits-link").classList.remove("hidden");
        document.querySelector(".galleries").classList.add("hidden");
      });
    });
  }

  function showUserGallery() {
    const userGallery = document.querySelector(".user-gallery");
    userGallery.addEventListener("click", function () {
      setUser(getCurrentUser());
      document.querySelector(".signup-page").classList.add("hidden-form");
      document.querySelector(".main-body").classList.remove("hidden");
      document.querySelector("#back-btn").classList.remove("hidden");
      document.querySelector(".credits-page").classList.add("hidden");
      document.querySelector(".credits-link").classList.remove("hidden");
      document.querySelector(".galleries").classList.add("hidden");
    });
  }

  function fetchGalleries(page = 0) {
    document.querySelector(".gallery-error").classList.add("hidden");
    setIsGalleryLoading(true);
    apiService
      .getGalleries(page)
      .then((galleries) => {
        if (galleries && galleries.length > 0) {
          setGalleries(galleries);
          setGalleryPage(page);
          showGalleries();
        }
      })
      .catch(() => {
        document.querySelector(".gallery-error").classList.remove("hidden");
      })
      .finally(() => {
        setIsGalleryLoading(false);
      });
  }

  function galleryNav() {
    const nextGallery = document.querySelector(".next-gallery-page");
    const prevGallery = document.querySelector(".prev-gallery-page");
    nextGallery.addEventListener("click", function () {
      fetchGalleries(getGalleryPage() + 1);
    });
    prevGallery.addEventListener("click", function () {
      if (getGalleryPage() === 0) return;
      fetchGalleries(getGalleryPage() - 1);
    });
  }

  function showForm() {
    const image_form = document.querySelector("#image-adder");
    const image_btn = document.querySelector("#image-add-btn");
    image_form.classList.add("hidden-form");
    image_btn.addEventListener("click", function () {
      if (image_form.classList.contains("hidden-form")) {
        image_form.classList.remove("hidden-form");
      } else {
        image_form.classList.add("hidden-form");
      }
    });
  }

  function fetchImage(cursor = null, direction = "desc", deleting = false) {
    setImageLoading(true);
    setImageError(false);
    return apiService
      .getImage(getUser(), cursor, direction)
      .then((res) => {
        if (!res.ok) {
          setImageError(true);
        }
        return res.json();
      })
      .then((image) => {
        if (!getImageError() && image.length > 0) {
          setImage(image);
        } else if (!getImageError() && deleting) {
          setImage(null);
        }
      })
      .finally(() => {
        setImageLoading(false);
      });
  }

  function showImage() {
    let image_viewer = document.querySelector("#image-viewer");
    let date = new Date(getImage()[0].createdAt);
    image_viewer.innerHTML = "";
    image_viewer.innerHTML = `
            <div class="image-title" id="image-title">${getImage()[0].title}</div>
            <div class="image-frame" id="image-frame">
                <img
                    class="main-image" id="image${getImage()[0].id}"
                    src="/api/images/${getImage()[0].id}/picture"
                    alt="${getImage()[0].title}"
                />
            </div>
            <div class="image-footer">
                <div class="image-author" id="image-author">By ${getImage()[0].User.username}</div>
                <div class="image-page" id="image-page">${getLength()}</div>
                <div class="image-date" id="image-date">On ${date.toLocaleDateString()}</div>
            </div>
        `;
    showComments();
  }

  function loadImage() {
    if (getLength() === 0) {
      document.querySelector("#image-display").classList.add("hidden");
      document.querySelector("#comments").classList.add("hidden");
      document.querySelector("#no-image-text").classList.remove("hidden-msg");
    } else {
      document.querySelector("#image-display").classList.remove("hidden");
      document.querySelector("#comments").classList.remove("hidden");
      document.querySelector("#no-image-text").classList.add("hidden-msg");
      fetchImage().then(() => {
        fetchComments();
      });
    }
  }

  function addImage() {
    const image_form = document.querySelector("#image-adder");
    image_form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      const title = formProps.title;
      const picture = formProps.picture;
      image_form.reset();
      const allowedTypes = ["image/jpeg", "image/png"];
      if (
        picture === undefined ||
        picture === null ||
        !allowedTypes.includes(picture.type)
      ) {
        document.querySelector(".file-validate").classList.remove("hidden-msg");
        return;
      }
      apiService
        .addImage(title, getCurrentUser(), picture)
        .then((res) => {
          if (!res.ok) {
            document
              .querySelector(".img-validate")
              .classList.remove("hidden-msg");
          }
          return res.json();
        })
        .then((res) => {
          if (res.Error) {
            document.querySelector(".img-validate-msg").innerHTML = res.Error;
            return;
          }
          apiService.getLength(getUser()).then((length) => {
            setLength(length.length);
          });
        });
    });
  }

  function changeImage() {
    const prev_img = document.querySelector(".left-arrow.icon.col-1");
    const next_img = document.querySelector(".right-arrow.icon.col-1");

    prev_img.addEventListener("click", function () {
      fetchImage(getImageCursor(), "asc");
    });

    next_img.addEventListener("click", function () {
      fetchImage(getImageCursor(), "desc");
    });
  }

  function deleteImage() {
    const delete_btn = document.querySelector("#image-delete-btn");
    delete_btn.addEventListener("click", function () {
      if (getLength() === 0) return;
      const deletedImage = getImage()[0];
      const deleteCursor = getImageCursor();
      setImage(null);
      apiService.deleteImage(deletedImage.id).then((res) => {
        if (!res.ok) {
          document
            .querySelector(".img-validate")
            .classList.remove("hidden-msg");
          document.querySelector(".img-validate-msg").innerHTML =
            "Failed to delete image.";
          return;
        }
        fetchImage(deleteCursor, "desc", true).then(() =>
          apiService.getLength(getUser()).then((res) => {
            setLength(res.length);
          }),
        );
      });
    });
  }

  function addComment() {
    const comment_form = document.querySelector("#comment-adder");
    comment_form.addEventListener("submit", function (e) {
      e.preventDefault();
      const commentData = new FormData(e.target);
      const commentProps = Object.fromEntries(commentData);
      const content = commentProps.added_comment;
      const author = getCurrentUser();
      comment_form.reset();
      apiService
        .addComment(getImage()[0].id, author, content)
        .then((res) => {
          if (!res.ok) {
            document
              .querySelector(".comment-validate")
              .classList.remove("hidden-msg");
          }
          return res.json();
        })
        .then((comment) => {
          if (comment.Error) {
            document.querySelector(".comment-validate-msg").innerHTML =
              comment.Error;
            return;
          }
          const existing = getComments().find((c) => c.id === comment.id);
          if (!existing) {
            setComments([comment, ...getComments()]);
          }
          if (getCommentsCursor() === null) {
            setCommentsCursor(comment.id);
          }
        });
    });
  }

  function fetchComments() {
    setCommentError(false);
    setCommentLoading(true);
    apiService
      .getComments(getCommentsCursor(), getImage()[0].id)
      .then((result) => {
        if (!result.ok) {
          setCommentError(true);
        }
        return result.json();
      })
      .then((result) => {
        if (!getCommentError() && result.comments.length > 0) {
          setComments(result.comments);
          setCommentsCursor(result.cursor);
        } else if (!getCommentError() && result.comments.length === 0) {
          setComments([]);
          setCommentsCursor(null);
        }
      })
      .finally(() => {
        setCommentLoading(false);
      });
  }

  function fetchMoreComments() {
    setCommentLoading(true);
    setCommentError(false);
    return apiService
      .getComments(getCommentsCursor(), getImage()[0].id)
      .then((res) => {
        if (!res.ok) {
          setCommentError(true);
        }
        return res.json();
      })
      .then((result) => {
        if (!getCommentError() && result.comments.length === 0) {
          setCommentsCursor(null);
        } else if (!getCommentError()) {
          const existingIds = new Set(getComments().map((c) => c.id));
          const newComments = result.comments.filter(
            (c) => !existingIds.has(c.id),
          );
          setComments([...getComments(), ...newComments]);
          setCommentsCursor(result.cursor);
        }
      })
      .finally(() => {
        setCommentLoading(false);
      });
  }

  function showComments() {
    if (getLength() === 0) return;

    let comment_list = document.querySelector("#comments-list");

    comment_list.innerHTML = "";
    for (let i = 0; i < getComments().length; i++) {
      let comment = getComments()[i];
      let elmt = commentComponent(comment);
      comment_list.append(elmt);
    }
  }

  function commentComponent(comment) {
    let elmt = document.createElement("div");
    elmt.className = "comment-item";
    elmt.id = "comment" + comment.id;
    const date = new Date(comment.createdAt);
    elmt.innerHTML = `
                <div class="comment-head"> 
                    <div class="comment-author">${comment.User.username}</div>
                    <div class="comment-date">${date.toLocaleDateString()}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-delete"></div>
                </div>
        `;
    elmt
      .querySelector(".comment-delete")
      .addEventListener("click", function () {
        apiService.deleteComment(comment.id).then((res) => {
          if (!res.ok) {
            return;
          } else {
            const comments = getComments().filter((c) => c.id !== comment.id);
            setComments(comments);
            if (comments.length === 0) {
              setCommentsCursor(null);
            } else if (getCommentsCursor() === comment.id) {
              setCommentsCursor(comments[comments.length - 1].id);
            }
          }
        });
      });
    if (comment.UserId != getCurrentUser() && getUser() != getCurrentUser()) {
      elmt.querySelector(".comment-delete").classList.add("hide-it");
    } else {
      elmt.querySelector(".comment-delete").classList.remove("hide-it");
    }

    return elmt;
  }

  function handleAuthentication() {
    document.querySelector("#auth-btn").addEventListener("click", function () {
      document.querySelector(".signup-page").classList.remove("hidden-form");
      document.querySelector(".main-body").classList.add("hidden");
      document.querySelector("#back-btn").classList.remove("hidden");
      document.querySelector(".credits-link").classList.remove("hidden");
      document.querySelector(".credits-page").classList.add("hidden");
      document.querySelector(".galleries").classList.add("hidden");
    });

    document
      .querySelector("#signup-auth-btn")
      .addEventListener("click", function () {
        const signupForm = document.querySelector(".auth-form");
        const username = signupForm.elements["username"].value;
        const password = signupForm.elements["password"].value;
        apiService
          .signup(username, password)
          .then(() => {
            document
              .querySelector(".signup-validate")
              .classList.add("hidden-form");
          })
          .catch((error) => {
            document
              .querySelector(".signup-validate")
              .classList.remove("hidden-form");
            document.querySelector(".signup-validate-msg").innerHTML =
              error.message;
          });
        signupForm.reset();
      });

    document
      .querySelector("#login-auth-btn")
      .addEventListener("click", function () {
        const loginForm = document.querySelector(".auth-form");
        const username = loginForm.elements["username"].value;
        const password = loginForm.elements["password"].value;
        apiService
          .login(username, password)
          .then(() => {
            document
              .querySelector(".signup-validate")
              .classList.add("hidden-form");
            setCurrentUser(user.userId);
            setIsLoggedIn(true);
          })
          .catch((error) => {
            document
              .querySelector(".signup-validate")
              .classList.remove("hidden-form");
            document.querySelector(".signup-validate-msg").innerHTML =
              error.message;
          });
        loginForm.reset();
      });

    document
      .querySelector("#logout-btn")
      .addEventListener("click", function () {
        apiService.signout();
        setIsLoggedIn(false);
        setCurrentUser(null);
      });
  }

  window.onload = function () {
    fetchGalleries();

    meact.useEffect(
      function () {
        apiService.getLength(getUser()).then((res) => {
          setLength(res.length);
          loadImage();
        });
      },
      [user],
    );

    showUserGallery();
    galleryNav();

    meact.useEffect(
      function () {
        document.querySelector(".gallery-page-number").innerText =
          getGalleryPage() + 1;
      },
      [galleryPage],
    );

    // apiService.getUser().then((res) => {
    //   if (res.ok) {
    //     return res.json();
    //   }
    //   return;
    // }).then((user) => {
    //   if (user) {
    //     setCurrentUser(user.userId);
    //     getIsLoggedIn(true);
    //   } else {
    //     getIsLoggedIn(false);
    //   }
    // });

    meact.useEffect(
      function () {
        if (getIsGalleryLoading()) {
          document.querySelector(".gallery-loader").classList.remove("hidden");
          document.querySelector(".gallery-container").classList.add("hidden");
        } else {
          document.querySelector(".gallery-loader").classList.add("hidden");
          document
            .querySelector(".gallery-container")
            .classList.remove("hidden");
        }
      },
      [isGalleryLoading],
    );

    meact.useEffect(
      function () {
        if (getIsLoggedIn()) {
          document.querySelector("#logout-btn").classList.remove("hidden");
          document.querySelector("#comments").classList.remove("hide-it");
          document.querySelector(".user-gallery").classList.remove("hidden");
          apiService
            .getUser()
            .then((res) => {
              if (res.ok) {
                return res.json();
              } else {
                throw new Error("Failed to fetch user");
              }
            })
            .then((user) => {
              setCurrentUser(user.userId);
            });
        } else {
          document.querySelector("#logout-btn").classList.add("hidden");
          document.querySelector("#comments").classList.add("hide-it");
          document.querySelector(".user-gallery").classList.add("hidden");
          setCurrentUser(null);
        }
      },
      [isLoggedIn],
    );

    meact.useEffect(
      function () {
        if (getUser() == getCurrentUser()) {
          document
            .querySelector("#image-delete-btn")
            .classList.remove("hidden");
          document.querySelector("#image-add-btn").classList.remove("hidden");
        } else {
          document.querySelector("#image-delete-btn").classList.add("hidden");
          document.querySelector("#image-add-btn").classList.add("hidden");
        }
      },
      [user, currentUser],
    );

    meact.useEffect(
      function () {
        if (getLength() === 0) {
          setImage(null);
          loadImage();
        } else if (!getImage()) {
          fetchImage();
          loadImage();
        } else {
          showImage();
        }
      },
      [length],
    );

    meact.useEffect(
      function () {
        setImageCursor(getImage() ? getImage()[0].id : null);
        setCommentError(false);
        setCommentsCursor(null);
        setComments([]);
        setInfiniteLoading(null);
        if (getImage()) {
          showImage();
          if (getIsLoggedIn()) {
            fetchComments();
          }
        }
      },
      [image, isLoggedIn],
    );

    document.addEventListener("scroll", function () {
      const cursor = getCommentsCursor();
      if (cursor === null || getInfiniteLoading()) return;
      // when I scroll to the bottom of the page
      if (
        document.documentElement.scrollHeight - window.innerHeight <=
        document.documentElement.scrollTop + 50
      ) {
        setInfiniteLoading(true);
      }
    });

    meact.useEffect(() => {
      if (!getInfiniteLoading()) return;
      fetchMoreComments().finally(() => {
        setInfiniteLoading(false);
      });
    }, [infiniteLoading]);

    meact.useEffect(
      function () {
        if (getIsLoggedIn()) {
          showComments();
        }
      },
      [comments, isLoggedIn],
    );

    meact.useEffect(
      function () {
        const commentLoader = document.querySelector(".comment-loader");
        const commentErrorIcon = document.querySelector(".comment-error");
        if (getCommentLoading()) {
          commentLoader.classList.remove("hide-it");
          commentErrorIcon.classList.add("hide-it");
        } else if (getCommentError()) {
          commentLoader.classList.add("hide-it");
          commentErrorIcon.classList.remove("hide-it");
        } else {
          commentLoader.classList.add("hide-it");
          commentErrorIcon.classList.add("hide-it");
        }
      },
      [commentLoading, commentError],
    );

    meact.useEffect(
      function () {
        const imageViewer = document.querySelector(".image-viewer");
        const loadingIcon = document.querySelector(".icon-viewer");
        const errorIcon = document.querySelector(".error-viewer");
        if (getImageLoading()) {
          imageViewer.classList.add("hidden");
          errorIcon.classList.add("hidden");
          loadingIcon.classList.remove("hidden");
        } else if (getImageError()) {
          imageViewer.classList.add("hidden");
          loadingIcon.classList.add("hidden");
          errorIcon.classList.remove("hidden");
        } else {
          imageViewer.classList.remove("hidden");
          loadingIcon.classList.add("hidden");
          errorIcon.classList.add("hidden");
        }
      },
      [imageLoading, imageError],
    );

    showForm();
    addImage();
    deleteImage();
    changeImage();
    addComment();

    document
      .querySelector(".validate-delete")
      .addEventListener("click", function () {
        document.querySelector(".file-validate").classList.add("hidden-msg");
      });
    document
      .querySelector(".empty-img-delete")
      .addEventListener("click", function () {
        document.querySelector(".img-validate").classList.add("hidden-msg");
      });

    document
      .querySelector(".empty-comment-delete")
      .addEventListener("click", function () {
        document.querySelector(".comment-validate").classList.add("hidden-msg");
      });

    handleAuthentication();

    document
      .querySelector(".empty-signup-delete")
      .addEventListener("click", function () {
        document.querySelector(".signup-validate").classList.add("hidden-form");
      });

    document.querySelector("#back-btn").addEventListener("click", function () {
      document.querySelector(".signup-page").classList.add("hidden-form");
      document.querySelector(".main-body").classList.add("hidden");
      document.querySelector("#back-btn").classList.add("hidden");
      document.querySelector(".credits-page").classList.add("hidden");
      document.querySelector(".credits-link").classList.remove("hidden");
      document.querySelector(".galleries").classList.remove("hidden");
      fetchGalleries();
    });

    document
      .querySelector(".credits-link")
      .addEventListener("click", function () {
        document.querySelector(".signup-page").classList.add("hidden-form");
        document.querySelector(".main-body").classList.add("hidden");
        document.querySelector("#back-btn").classList.remove("hidden");
        document.querySelector(".credits-page").classList.remove("hidden");
        document.querySelector(".credits-link").classList.add("hidden");
        document.querySelector(".galleries").classList.add("hidden");
      });
  };
})();
