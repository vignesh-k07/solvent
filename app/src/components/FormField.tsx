import React from "react";

interface IFormField {
  labelName: string;
  placeholder: string;
  inputType?: string;
  isTextArea?: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  value: string;
  disabled?: boolean;
}

const FormField = ({
  labelName,
  placeholder,
  inputType,
  isTextArea,
  handleChange,
  value,
  disabled
}: IFormField) => {
  return (
    <label className="w-full max-w-500 flex flex-col">
      {labelName && (
        <span className="font-epilogue font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px]">
          {labelName}
        </span>
      )}
      {isTextArea ? (
        <textarea
          required
          // value={value}
          onChange={handleChange}
          rows={7}
          placeholder={placeholder}
          className="w-full py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#EEF7FF] border-opacity-20 bg-transparent text-[#EEF7FF] text-[14px] placeholder:text-[#EEF7FF]/50 rounded-[10px]"
          disabled={disabled}
        />
      ) : (
        inputType === "date" ? (
          <input
            required
            // value={value}
            onChange={handleChange}
            type={inputType}
            step="0.1"
            placeholder={placeholder}
            className="w-full py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#EEF7FF] border-opacity-20 bg-transparent text-[#EEF7FF] text-[14px] placeholder:text-[#EEF7FF]/50 rounded-[10px]"
            disabled={disabled}
          />
        ) : (
          <input
            required
            value={value}
            onChange={handleChange}
            type={inputType}
            step="0.1"
            placeholder={placeholder}
            className="w-full py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#EEF7FF] border-opacity-20 bg-transparent text-[#EEF7FF] text-[14px] placeholder:text-[#EEF7FF]/50 rounded-[10px]"
            disabled={disabled}
          />
        )
      )}
    </label>
  );
};

export default FormField;
