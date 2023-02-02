import type { RefObject, UIEventHandler } from "react";
import { createRef, useCallback, useState } from "react";

export default function useScrollToBottom() {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const scrollElementRef = createRef<HTMLDivElement>();

  const handleScrollEvent: UIEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const { scrollTop } = event.currentTarget;
      setIsScrolledToBottom(scrollTop > -1);
    },
    []
  );

  const handleScrollToBottomClick = (
    scrollElement: RefObject<HTMLDivElement>
  ) => {
    scrollElement.current?.scrollTo({
      top: 1000,
      behavior: "smooth",
    });
  };

  return {
    isScrolledToBottom,
    handleScrollEvent,
    handleScrollToBottomClick,
    scrollElementRef,
  };
}
