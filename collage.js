var Collage = function() {
  this._elCollage = document.getElementById("collage");
  this._elCollageFrame = this._elCollage.parentElement;
  this._photoURLs = [];
  this._nPhotos = 0;
  this._layouts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  this._frameColor = "#ffffff";
  this._frameWidth = "10px";
  this._collageWidth = "25cm";
  this._collageHeight = "20cm";
};

Collage.prototype.getCurrentLayout = function() {
  return this._layouts[this._nPhotos - 1];
};

Collage.prototype._updateLayoutClasses = function() {
  // Remove any old layout classes
  while (this._elCollage.classList.length) {
    this._elCollage.classList.remove(this._elCollage.classList.item(0));
  }

  // Don't add layout classes if there are no photos
  if (this._nPhotos > 0) {
    this._elCollage.classList.add(
      "photos-" + this._photoURLs.length.toString()
    );
    this._elCollage.classList.add(
      "layout-" + this.getCurrentLayout().toString()
    );
  }
};

Collage.prototype.addPhoto = function(photoURL) {
  if (this._nPhotos >= 9) {
    return;
  }
  this._photoURLs.push(photoURL);
  this._nPhotos = this._photoURLs.length;

  var elPhotoFrame = document.createElement("div");
  elPhotoFrame.classList.add("photo-frame");

  var elPhoto = document.createElement("div");
  elPhoto.classList.add("photo");
  elPhoto.setAttribute("draggable", "true");
  elPhoto.style.backgroundImage =
    "url('" + this._photoURLs[this._nPhotos - 1] + "')";

  this._elCollage.appendChild(elPhotoFrame);
  elPhotoFrame.appendChild(elPhoto);

  this._updateLayoutClasses();
  return elPhoto;
};

Collage.prototype.removePhoto = function(photoIndex) {
  if (this._nPhotos <= 0) {
    return;
  }
  this._photoURLs.splice(photoIndex, 1);
  this._elCollage.childNodes[photoIndex].remove();
  this._nPhotos = this._photoURLs.length;

  this._updateLayoutClasses();
};

Collage.prototype.getIndexOfPhoto = function(elPhoto) {
  return Array.from(this._elCollage.children).indexOf(elPhoto.parentElement);
};

Collage.prototype.swapPhotos = function(i, j) {
  var tmp = this._photoURLs[i];
  this._photoURLs[i] = this._photoURLs[j];
  this._photoURLs[j] = tmp;

  this._elCollage.childNodes[i].querySelector(".photo").style.backgroundImage =
    "url('" + this._photoURLs[i] + "')";
  this._elCollage.childNodes[j].querySelector(".photo").style.backgroundImage =
    "url('" + this._photoURLs[j] + "')";
};

Collage.prototype.setLayout = function(layoutIndex) {
  this._layouts[this._nPhotos - 1] = layoutIndex;
  this._updateLayoutClasses();
};

Collage.prototype.setScale = function(scale) {
  this._elCollageFrame.style.width =
    "calc(" + this._collageWidth + " * " + scale + ")";
  this._elCollageFrame.style.height =
    "calc(" + this._collageHeight + " * " + scale + ")";
  this._elCollageFrame.style.height = (20 * scale).toString() + "cm";
  this._elCollageFrame.parentElement.style.fontSize =
    "calc(" + this._frameWidth + " * " + scale + ")";
};
