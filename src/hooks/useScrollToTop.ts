import type { RefObject, UIEventHandler } from "react";
import { createRef, useCallback, useState } from "react";

// See: Keep overflow div scrolled to bottom unless user scrolls up https://stackoverflow.com/a/21067431/13351497

export default function useScrollToTop() {
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const scrollElementRef = createRef<HTMLDivElement>();

  const handleScrollEvent: UIEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const { scrollTop } = event.currentTarget;
      setIsScrolledToTop(scrollTop === 0);
    },
    []
  );

  const handleScrollToTopClick = (scrollElement: RefObject<HTMLDivElement>) => {
    scrollElement.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return {
    isScrolledToBottom: isScrolledToTop,
    handleScrollEvent,
    handleScrollToTopClick,
    scrollElementRef,
  };
}
