import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Field from "./Field";
import "@testing-library/jest-dom";
import { vi } from "vitest";

test("formats and parses numbers", async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();
  render(<Field value={1000} onChange={handleChange} prefix="€" suffix="%" />);
  expect(screen.getByText("€")).toBeInTheDocument();
  expect(screen.getByText("%"));
  const input = screen.getByRole("textbox");
  expect(input.value).toBe("1.000");
  await user.clear(input);
  await user.type(input, "2000");
  expect(handleChange).toHaveBeenLastCalledWith(2000);
  expect(input.value).toBe("2.000");
});
