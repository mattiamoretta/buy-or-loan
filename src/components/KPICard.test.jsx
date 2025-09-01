import { render, screen } from "@testing-library/react";
import KPICard from "./KPICard";
import { Home } from "lucide-react";
import "@testing-library/jest-dom";

test("renders kpi card", () => {
  render(<KPICard title="Title" value="Value" subtitle="Sub" icon={Home} />);
  expect(screen.getByText("Title")).toBeInTheDocument();
  expect(screen.getByText("Value")).toBeInTheDocument();
  expect(screen.getByText("Sub")).toBeInTheDocument();
  expect(document.querySelector("svg")).toBeInTheDocument();
});
