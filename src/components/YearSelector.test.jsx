import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YearSelector from "./YearSelector";
import "@testing-library/jest-dom";
import { vi } from "vitest";

test("selects preset and shows custom input", async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();
  render(<YearSelector label="Years" value={10} onChange={handleChange} />);
  await user.click(screen.getByRole("button", { name: "20" }));
  expect(handleChange).toHaveBeenCalledWith(20);
  await user.click(screen.getByRole("button", { name: /custom/i }));
  expect(screen.getByRole("spinbutton")).toBeInTheDocument();
});
