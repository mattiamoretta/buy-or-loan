import { render, screen } from "@testing-library/react";
import Stepper from "./Stepper";
import { STEP_LABELS } from "../constants/texts";
import "@testing-library/jest-dom";

test("highlights active step", () => {
  render(<Stepper step={3} labels={STEP_LABELS.it} />);
  const active = screen.getByText("3");
  expect(active.className).toMatch(/bg-orange-600/);
});
