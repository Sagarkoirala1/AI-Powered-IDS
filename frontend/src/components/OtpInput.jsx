import { useRef } from "react";

export default function OtpInput({ length = 6, value, onChange }) {
  const inputsRef = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const setDigit = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (e, index) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }
    // Support pasting a full code into a single box
    if (raw.length > 1) {
      const next = value.split("");
      raw.split("").forEach((d, i) => {
        if (index + i < length) next[index + i] = d;
      });
      onChange(next.join("").slice(0, length));
      const target = Math.min(index + raw.length, length - 1);
      inputsRef.current[target]?.focus();
      return;
    }
    setDigit(index, raw);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="h-12 w-full rounded-md border border-base-line bg-base-panel text-center font-mono text-lg text-ink focus:border-signal"
        />
      ))}
    </div>
  );
}
