import type { Dispatch, SetStateAction } from "react";

interface InputBoxProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
}

export default function InputBox({ input, setInput }: InputBoxProps) {
  return (
    <section className="mt-2">
      <label
        htmlFor="input-area"
        className="block mb-1 text-white font-semibold text-sm"
      >
        Custom Input
      </label>

      <textarea
        id="input-area"
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter input for your program"
        className="w-full p-2 bg-gray-900 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 text-white font-mono text-sm"
      />
    </section>
  );
}
