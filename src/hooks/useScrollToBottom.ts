import type { RefObject, UIEventHandler } from "react";
import { createRef, useCallback, useState } from "react";

// See: https://stackoverflow.com/a/21067431/13351497

export default function useScrollToBottom() {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const scrollElementRef = createRef<HTMLDivElement>();

  const handleScrollEvent: UIEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const { scrollHeight, clientHeight, scrollTop } = event.currentTarget;
      setIsScrolledToBottom(scrollHeight - clientHeight <= scrollTop);
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
