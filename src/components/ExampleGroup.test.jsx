import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExampleGroup from "./ExampleGroup";
import "@testing-library/jest-dom";

test("toggles content visibility", async () => {
  const user = userEvent.setup();
  render(
    <ExampleGroup title="Group">
      <div>Content</div>
    </ExampleGroup>
  );
  expect(screen.queryByText("Content")).toBeNull();
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Content")).toBeVisible();
});
