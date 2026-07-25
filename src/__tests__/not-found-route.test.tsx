import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import NotFound from "@/pages/404";
import { rootReducer } from "@/app/providers/store-provider/config/rootReducer";
import { headerConfig } from "@/widgets/header/config";

/**
 * The 404 screen.
 *
 * The header is driven by a per-route config keyed on the pathname, so an unknown URL
 * matches nothing and renders an empty header — no title and no back arrow. That makes
 * the page itself responsible for offering a way out, which is what these check. This
 * file lives outside src/pages because anything under pages/ is treated as a route.
 */

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const push = jest.fn();

const renderNotFound = () => {
  (useRouter as jest.Mock).mockReturnValue({ push });
  (usePathname as jest.Mock).mockReturnValue("/no-such-page");

  return render(
    <Provider store={configureStore({ reducer: rootReducer })}>
      <NotFound />
    </Provider>
  );
};

describe("/404 route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The premise: an unknown path has no header entry, so the header cannot help here
  it("is a route the header config does not cover", () => {
    expect(headerConfig).not.toHaveProperty("/no-such-page");
  });

  // Says what happened, in place of the framework's bare default
  it("explains itself", () => {
    renderNotFound();

    expect(screen.getByTestId("not-found")).toBeInTheDocument();
    expect(screen.getByText("This page does not exist")).toBeInTheDocument();
  });

  // The one thing a dead end must have
  it("offers a way home", () => {
    renderNotFound();

    fireEvent.click(screen.getByRole("button", { name: /Back to home/i }));

    expect(push).toHaveBeenCalledWith("/");
  });

  // And the usual tab bar, so the cart and profile stay one tap away
  it("keeps the tab bar", () => {
    renderNotFound();

    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument();
  });

  // Those tabs have to work from here too
  it("routes from the tab bar", () => {
    renderNotFound();

    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(push).toHaveBeenCalledWith("/profile");
  });
});
