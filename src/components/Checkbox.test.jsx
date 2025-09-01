import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "./Checkbox";
import "@testing-library/jest-dom";
import { vi } from "vitest";

test("calls onChange when toggled", async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();
  render(<Checkbox label="Check" checked={false} onChange={handleChange} />);
  await user.click(screen.getByRole("checkbox"));
  expect(handleChange).toHaveBeenCalledWith(true);
});
