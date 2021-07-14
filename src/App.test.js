import { render, screen } from "@testing-library/react";
import App from "./App";

describe("rendering the Home page", () => {
  render(<App />);

  it("adds a title", () => {
    const titleElement = screen.queryByTestId("app-title");
    expect(titleElement).toBeInTheDocument();
  });

  // it("adds an interactive map", () => {
  //   const mapElement = screen.queryByTestId("interactive-map");
  //   expect(mapElement).toBeInTheDocument();
  // });
});
