import React from "react";

export default function TiltedCard({
  imageSrc,
  altText = "Card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  overlayContent = null,
  displayOverlayContent = false,
}) {
  return (
    <figure
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
    >
      <div
        className="relative"
        style={{
          width: imageWidth,
          height: imageHeight,
        }}
      >
        <img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-lg"
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
        />

        {displayOverlayContent && overlayContent && (
          <div className="absolute top-0 left-0 z-10">
            {overlayContent}
          </div>
        )}
      </div>

      {captionText && (
        <figcaption className="mt-2 text-sm">
          {captionText}
        </figcaption>
      )}
    </figure>
  );
} 