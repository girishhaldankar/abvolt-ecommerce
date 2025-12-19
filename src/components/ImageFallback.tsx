import { FC, ImgHTMLAttributes, useState } from "react";

interface ImageFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageFallback: FC<ImageFallbackProps> = ({
  src,
  fallbackSrc = "https://via.placeholder.com/400x300?text=No+Image",
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      className={props.className}
    />
  );
};
