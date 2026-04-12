import React, { memo, useEffect, useRef, useState } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses = {
  lift: "support-reveal-lift",
  soft: "support-reveal-soft",
  hero: "support-reveal-hero",
};

const SupportReveal = memo(function SupportReveal({
  children,
  as: Component = "div",
  className = "",
  variant = "lift",
  threshold = 0.18,
  rootMargin = "0px 0px -8% 0px",
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
    <Component
      ref={ref}
      {...restProps}
      className={cn(
        "support-reveal",
        variantClasses[variant] || variantClasses.lift,
        isVisible && "is-visible",
        className,
      )}
    >
      {children}
    </Component>
  );
});

export default SupportReveal;
