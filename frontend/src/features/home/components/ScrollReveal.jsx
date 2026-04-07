import React, { memo, useEffect, useRef, useState } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ScrollReveal = memo(function ScrollReveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.18,
  rootMargin = "0px 0px -10% 0px",
  ...restProps
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div
      ref={ref}
      {...restProps}
      className={cn(
        "reveal-on-scroll",
        isVisible && "is-visible",
        delay ? `reveal-delay-${delay}` : "",
        className,
      )}
    >
      {children}
    </div>
  );
});

export default ScrollReveal;
