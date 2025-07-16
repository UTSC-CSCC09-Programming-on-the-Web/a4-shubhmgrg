[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/8gdjCTTP)

# Web Gallery: Frontend

The objective of these assignments is to build an application called _The Web Gallery_ where users can share pictures and comments. This application is similar to existing web applications such as Facebook, Instagram or Tiktok.

In this first assignment, we will concentrate on the frontend only. Users will be able to add images to the gallery.

Our app will have two URLs:

- `/index.html` is the main page where users can browse through images, add new images and comment.

- `/credits.html` is the credits page that should contain the references of the images, buttons and snippets of code
  that you have used for this assignment.

## Instructions

For this assignment, you must:

- Implement all CSS from scratch
- Write Vanilla Javascript only
- Implement the web app as a Single Page Application (SPA) - the page should not reload by itself

You may:

- Use `cols.css` (12-column layout) from the lab to structure your page.

You are NOT allowed to:

- use any CSS frameworks like (but not limited to) Bootstrap or TailwindCSS
- use any javascript library or framework (like jQuery, or React...)
- use or develop any server-side feature
- use CSS code developed in the labs. (your frontend must not)

### Code quality and organization

The repository must be organized as follows:

- `index.html`
- `credits.html`
- `js/`: all javascript files
- `styles/`: all css files
- `media/`: all media files related to the UI (images, icons and so on)

Your code must be of good quality and follow all recommendations given throughout the course. In this assignment, it means (non necessarily exhaustive):

- not use deprecated HTML tags
- proper use of id and class attributes
- the page does not reload by itself (it is a single page application)
- the page should not need to be reloaded to work
- use encapsulation and strict mode for Javascript code
- use of `eslint` to validate Javascript code
- use of `prettier` to format HTML/CSS/JS
- separates the **Frontend Controller** from **the Frontend API Service** as seen in the Javascript lab
- correct coding style, indentation and comments (whenever appropriate)
- all icons, images and other design elements are appropriately credited in `credits.html`.
- all code found online and adapted are appropriately credited as comments and in `credits.html`.

### Submission

You must deploy your web gallery on Github Pages.

You must also submit your code through Gradescope by connecting your Github Repo to `a1`.

> [!CAUTION]
> Please submit on Gradescope on top of pushing your code to Github. If you do not submit on Gradescope, your assignment cannot not be graded.

## Designing the UI

In this part, you are going to design the UI (HTML and CSS) of _The Web Gallery_ app. Our UI to contain the following components:

1. **the add-image form** allows users to add a picture from the web to the gallery by copying and pasting its url into the form (we will enable file upload in the next assignment). This component should contain at least:
   - a button to toggle (show/hide) the "Add Image" form
   - The "Add Image" form should contain
     - Image title
     - Author's Name
     - Image URL
2. **the image display** shows current image. This component should contain at least:
   - the image currently displayed
   - the image title
   - the image author
   - two buttons to move to the previous and next image in the gallery
   - a delete button
   - the total number of images in the gallery
3. **the comment form** allows users to add comments to the current picture.
   - This component should contain at least:
     - The author's name
     - The comment
4. **the comment section** that shows the most recent comments for the current picture. This component should contain at least:
   - the 10 most recent comments only. Each comment should be composed of:
     - the author's name
     - the date when the comment was posted
     - the text
     - a delete button
   - two buttons to move to the older or later series of 10 comments (still related to the same image)

> [!IMPORTANT]
> Your styling must be elegant, original and use some CSS animations. The styling must not resemble Microblog in any shape or form. Look at the design of Instagram, Facebook or Google Photos for inspiration.

## Building the features

In this part, you are going to build some frontend features. Data will be stored in `localStorage` and updated when users
interacts with the app. The data should be persistent. This means that any comment or image previously added should appear (wherever appropriate) when the user browse through the gallery even if the page is reloaded.

> [!WARNING]  
> Ensure that even when you do `localStorage.clear()`, the app should still work as expected.

As done for the lab, the javascript code must be separated in two: the **Frontend Controller** and the **the Frontend API Service**. For the **Frontend API Service**, we provide a starter file called `api-service.js`.

> [!CAUTION]
> Do not modify the type contracts as this file will be automarked.

### Adding and deleting images to the gallery

Users should be able to toggle (show/hide) the add-image form as needed. When the gallery is empty, only the toggle
button should show (and the add-image form if toggled on).

Once the form is submitted, the image should be added to the gallery and the page should show that image as the
current displayed image. Finally, the form should be cleared automatically to allow a new entry.

Users should be able to delete any image in the gallery.

### Browsing through the gallery

Only one image should be displayed in the page along with its title and author. Users should be able to navigate to the previous or next image in the gallery using the previous and next button of the page.

Users should be able to see the total number of images in the gallery.

Users should be able to delete an image by clicking on the delete button. Once the image is deleted either the next image in the gallery is shown (if any). If there are no images, show an appropriate page that denotes the gallery is empty.

Although all data are currently stored locally, we do not want to load all gallery images at once into the DOM. Our goal is to build a responsive web gallery that can handle a large amount (thousands) of images. Therefore, we prefer to update the DOM with only the relevant data as the user navigates through the gallery. This means that we should not use _out of the box_ HTML and CSS sliders since they require to load all images in the DOM.

### Commenting on images

Users should be able to add a comment to the picture that is currently displayed using the comment form. Once submitted, the form should be cleared to allow a new entry.

As users browse through the gallery, the comment section should be updated to display the comments associated with the displayed image only. Each comment should contain the name, the creation date (that was automatically added) and the content.

The comment section should only show that last 10 comments with the most recent on top. The users can navigate through all comments by using buttons that will show the previous or next 10 comments for displayed image.

Users should be able to delete any comment.

## Deploy this on Github Pages

Enable Github Pages building and ensure that your site can be visited through the `index.html` page.

> [!IMPORTANT]  
> You will not receive a grade if your site is not deployed on Github Pages.

## Grading

> [!CAUTION]
> Please submit on Gradescope on top of pushing your code to Github. If you do not submit on Gradescope, your assignment cannot not be graded.

- Adding and deleting images [10pts]
- Browsing through the gallery [15pts]
- Commenting on images [10pts]
- UI Layout [15pts]
- Credits in credits.html [2pts]
- UI is elegent and original [10pts]
- Repository Organization [2pts]
- HTML/CSS/JS best practices [32pts]
- No debugging and or error messages in JS console [4pts]

Total: 100pts
