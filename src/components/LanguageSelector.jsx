import React from "react";

export default function LanguageSelector({ language, setLanguage }) {
  return (
    <div className="fixed top-4 right-4">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border rounded px-2 py-1 bg-white"
      >
        <option value="it">IT</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
