import type { ImgHTMLAttributes } from "react";
export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  src: string | { src: string };
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  unoptimized?: boolean;
}
export default function Image({
  src,
  priority,
  fill,
  quality: _quality,
  unoptimized: _unoptimized,
  style,
  ...props
}: ImageProps) {
  return (
    <img
      {...props}
      src={typeof src === "string" ? src : src.src}
      loading={priority ? "eager" : props.loading}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              ...style,
            }
          : style
      }
    />
  );
}
