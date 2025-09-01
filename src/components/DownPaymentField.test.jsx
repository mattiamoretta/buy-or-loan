import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownPaymentField from "./DownPaymentField";
import "@testing-library/jest-dom";
import React, { useState } from "react";

test("switches mode and updates value", async () => {
  const user = userEvent.setup();
  function Wrapper() {
    const [downPaymentRatio, setDownPaymentRatio] = useState(0.1);
    const [mode, setMode] = useState("pct");
    return (
      <DownPaymentField
        price={100}
        downPaymentRatio={downPaymentRatio}
        setDownPaymentRatio={setDownPaymentRatio}
        mode={mode}
        setMode={setMode}
      />
    );
  }
  render(<Wrapper />);
  await user.click(screen.getByRole("button", { name: "€" }));
  const input = screen.getByRole("textbox");
  await user.clear(input);
  await user.type(input, "50");
  await user.click(screen.getByRole("button", { name: "%" }));
  expect(screen.getByRole("textbox").value).toBe("50");
});
