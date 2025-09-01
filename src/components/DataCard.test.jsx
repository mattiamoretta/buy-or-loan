import { render, screen } from "@testing-library/react";
import DataCard from "./DataCard";
import { Home } from "lucide-react";
import "@testing-library/jest-dom";

test("renders label and value", () => {
  render(<DataCard icon={Home} label="Label" value="123" />);
  expect(screen.getByText("Label")).toBeInTheDocument();
  expect(screen.getByText("123")).toBeInTheDocument();
  expect(document.querySelector("svg")).toBeInTheDocument();
});

test("renders items list", () => {
  const items = [
    { label: "A", value: "1" },
    { label: "B", value: "2" },
  ];
  render(<DataCard label="Items" items={items} />);
  expect(screen.getByText("A")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});
