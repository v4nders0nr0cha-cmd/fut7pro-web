/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";

const NextImage = (props: ImgHTMLAttributes<HTMLImageElement>) => {
  const { src = "", alt = "", fill: _fill, priority: _priority, ...rest } = props;
  return <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...rest} />;
};

export default NextImage;
