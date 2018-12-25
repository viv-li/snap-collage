/* global Collage */

var Editor = function() {
  this._elTrayImages = document.getElementById("tray-images");
  this._collage = new Collage();
  this._elCollageFrame = this._collage._elCollage.parentElement;
  this._elCollageScrollContainer = document.getElementById(
    "collage-scroll-container"
  );
  this._wasDraggedFromTray;
  this._elCanvasSize = document.getElementById("canvas-size");
};

Editor.prototype.initialise = function() {
  // Fit canvas to window and add event listener for resizing.
  this.fitCollage();
  window.addEventListener("resize", this.fitCollage.bind(this));

  // Event listeners for dragging images from tray to canvas
  this._elTrayImages.querySelectorAll(".gallery-image").forEach(el => {
    el.addEventListener("dragstart", this.onTrayImageDragstart.bind(this));
  });
  this._elCollageFrame.addEventListener(
    "dragover",
    this.onCollageDragover.bind(this)
  );
  this._collage._elCollage.addEventListener(
    "dragover",
    this.onCollageDragover.bind(this)
  );
  this._elCollageFrame.addEventListener("drop", this.onCollageDrop.bind(this));

  // Event listeners for dragging images from canvas
  this._collage._elCollage.querySelectorAll(".photo").forEach(el => {
    el.addEventListener("dragstart", this.onCollageImageDragstart.bind(this));
  });

  // Event listeners for dropping images from collage onto another collage image
  this._collage._elCollage.querySelectorAll(".photo").forEach(el => {
    el.addEventListener("dragover", this.onCollageImageDragover.bind(this));
  });
  this._collage._elCollage.querySelectorAll(".photo").forEach(el => {
    el.addEventListener("drop", this.onCollageImageDrop.bind(this));
  });

  // Event listeners for dropping from
  this._elTrayImages.addEventListener(
    "dragover",
    this.onTrayDragover.bind(this)
  );
  this._elTrayImages.addEventListener("drop", this.onTrayDrop.bind(this));

  // Event listeners for whole document management of drag state indicators
  document.addEventListener("dragleave", this.onDragleave.bind(this));
  document.addEventListener("dragend", this.onDragend.bind(this));
};

Editor.prototype.fitCollage = function() {
  this._collage.setScale(1);
  var scaleX =
    (this._elCollageScrollContainer.clientWidth - 40) /
    this._elCollageFrame.scrollHeight;
  var scaleY =
    (this._elCollageScrollContainer.clientHeight - 40) /
    this._elCollageFrame.scrollHeight;
  var scale = Math.min(scaleX, scaleY);
  this._collage.setScale(scale);
  this._elCanvasSize.textContent = Math.round(scale * 100).toString() + "%";
};

Editor.prototype.onTrayImageDragstart = function(event) {
  event.dataTransfer.setData("text/uri-list", event.target.src);
  this._wasDraggedFromTray = true;
  this._elCollageFrame.setAttribute("droppable", "true");
  document.body.classList.add("dragging");
};

Editor.prototype.onCollageDragover = function(event) {
  event.preventDefault();
  if (this._wasDraggedFromTray) {
    this._elCollageFrame.classList.add("active-drop-target");
  } else {
    console.log();
  }
};

Editor.prototype.onCollageDrop = function(event) {
  event.preventDefault();
  if (this._wasDraggedFromTray) {
    var photoURL = event.dataTransfer.getData("text/uri-list");
    var elPhoto = this._collage.addPhoto(photoURL);
    elPhoto.addEventListener(
      "dragstart",
      this.onCollageImageDragstart.bind(this)
    );
    elPhoto.addEventListener(
      "dragover",
      this.onCollageImageDragover.bind(this)
    );
    elPhoto.addEventListener("drop", this.onCollageImageDrop.bind(this));
  }
};

Editor.prototype.onCollageImageDragstart = function(event) {
  var photoIndex = this._collage.getIndexOfPhoto(event.target);
  event.dataTransfer.setData("text/plain", photoIndex.toString());
  this._wasDraggedFromTray = false;

  this._elCollageFrame.querySelectorAll(".photo").forEach(el => {
    var elIndex = this._collage.getIndexOfPhoto(el);
    if (elIndex !== photoIndex) {
      el.setAttribute("droppable", "true");
    }
  });
  this._elTrayImages.setAttribute("droppable", "true");
  document.body.classList.add("dragging");
};

Editor.prototype.onCollageImageDragover = function(event) {
  event.preventDefault();
  if (!this._wasDraggedFromTray) {
    event.target.classList.add("active-drop-target");
  }
};

Editor.prototype.onCollageImageDrop = function(event) {
  event.preventDefault();
  if (!this._wasDraggedFromTray) {
    var dragPhotoIndex = parseInt(event.dataTransfer.getData("text/plain"));
    var dropPhotoIndex = this._collage.getIndexOfPhoto(event.target);
    this._collage.swapPhotos(dragPhotoIndex, dropPhotoIndex);
    event.target;
  }
};

Editor.prototype.onTrayDragover = function(event) {
  event.preventDefault();
  if (!this._wasDraggedFromTray) {
    event.target.classList.add("active-drop-target");
  }
};

Editor.prototype.onTrayDrop = function(event) {
  event.preventDefault();
  if (!this._wasDraggedFromTray) {
    var dragPhotoIndex = parseInt(event.dataTransfer.getData("text/plain"));
    this._collage.removePhoto(dragPhotoIndex);
  }

  // There's some bug where dragend doesn't fire when drop happens on tray so we call it manually.
  this.onDragend();
};

Editor.prototype.onDragleave = function(event) {
  event.target.classList.remove("active-drop-target");
};

Editor.prototype.onDragend = function(event) {
  console.log("Dragend");
  document.querySelectorAll(".active-drop-target").forEach(el => {
    console.log(el);
    el.classList.remove("active-drop-target");
  });
  this._elTrayImages.setAttribute("droppable", "false");
  this._elCollageFrame.setAttribute("droppable", "false");
  this._elCollageFrame.querySelectorAll(".photo").forEach(el => {
    el.setAttribute("droppable", "false");
  });
  document.body.classList.remove("dragging");
};

document.addEventListener("DOMContentLoaded", () => {
  window._editor = new Editor();
  window._editor.initialise();
});
