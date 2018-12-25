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

  this._elToolbarLayouts = document.getElementById("toolbar-layouts");
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

  // Layout toolbar reset and event listeners
  this.updateToolbarLayouts();
  this._elToolbarLayouts.querySelectorAll(".button").forEach(el => {
    el.addEventListener("click", this.onLayoutButtonClick.bind(this));
  });
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

Editor.prototype.updateToolbarLayouts = function() {
  for (let el of Array.from(this._elToolbarLayouts.children)) {
    el.style.display = "none";
  }

  if (this._collage._nPhotos >= 2) {
    var elActiveToolbar = this._elToolbarLayouts.querySelector(
      ".photos-" + this._collage._nPhotos.toString()
    );
    this._updateActiveLayout(elActiveToolbar);
    elActiveToolbar.style.display = "block";
  }
};

Editor.prototype._updateActiveLayout = function(elToolbar) {
  for (let el of Array.from(elToolbar.children)) {
    el.classList.remove("active");
  }
  elToolbar.children[this._collage.getCurrentLayout()].classList.add("active");
};

Editor.prototype.onLayoutButtonClick = function(event) {
  var layoutIndex = Array.from(event.target.parentElement.children).indexOf(
    event.target
  );
  this._collage.setLayout(layoutIndex);
  this._updateActiveLayout(event.target.parentElement);
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

    this.updateToolbarLayouts();
  }
};

Editor.prototype.onCollageImageDragstart = function(event) {
  var photoIndex = this._collage.getIndexOfPhoto(event.target);
  event.dataTransfer.setData("text/plain", photoIndex.toString());
  var imageSrc = event.target.style.backgroundImage.slice(-16, -2);

  var dragImage = this._elTrayImages.querySelector(
    'img[src="' + imageSrc + '"]'
  );
  event.dataTransfer.setDragImage(dragImage, 10, 10);

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
    // There's some bug where dragend doesn't fire when drop happens on tray so we call it manually.
    this.onDragend();
    this.updateToolbarLayouts();
  }
};

Editor.prototype.onDragleave = function(event) {
  event.target.classList.remove("active-drop-target");
};

Editor.prototype.onDragend = function(event) {
  document.querySelectorAll(".active-drop-target").forEach(el => {
    el.classList.remove("active-drop-target");
  });
  this._elTrayImages.setAttribute("droppable", "false");
  this._elCollageFrame.setAttribute("droppable", "false");
  this._elCollageFrame.querySelectorAll(".photo").forEach(el => {
    el.setAttribute("droppable", "false");
  });
  document.body.classList.remove("dragging");
};
