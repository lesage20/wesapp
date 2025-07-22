import MaskInput, { formatWithMask } from "react-native-mask-input";
import { useEffect, useState } from "react";
import clsx from "clsx";

const FORMAT_MASKS = {
  FREEMIUM_1: [/\d/, /\d/, /\d/, "-", /[A-Z]/, /[A-Z]/, "-", /\d/, /\d/, /\d/, "-", /[A-Z]/, /[A-Z]/, /[A-Z]/],
  FREEMIUM_2: [/[A-Z]/, /[A-Z]/, /[A-Z]/, "-", /\d/, /\d/, /\d/, /\d/, "-", /[A-Z]/, /[A-Z]/, /[A-Z]/],
  FREEMIUM_3: [/\d/, /\d/, /\d/, "-", /[A-Z]/, /[A-Z]/, /[A-Z]/, /[A-Z]/, "-", /[A-Z]/, /[A-Z]/, /[A-Z]/],
  PREMIUM: [/[A-Z]/, /[A-Z]/, "-", /\d/, /\d/, /\d/, /\d/, "-", /[A-Z]/, /[A-Z]/, "-", /[A-Z]/, /[A-Z]/, /[A-Z]/],
};

export type FormatType = keyof typeof FORMAT_MASKS;

const detectFormat = (text: string): FormatType | undefined => {
  const cleanText = text.replace(/[^A-Z0-9]/g, "");

  if (cleanText.length === 0) return undefined;

  const firstTwoChars = cleanText.slice(0, 2);
  const firstThreeChars = cleanText.slice(0, 3);

  // Check FREEMIUM_2 first (AAA-0000-USA)
  if (/^[A-Z]{3}/.test(firstThreeChars)) {
    if (cleanText.length >= 7) {
      const numbersPart = cleanText.slice(3, 7);
      const lastThreeChars = cleanText.slice(7, 10);
      if (/^\d{4}$/.test(numbersPart) && /^[A-Z]{3}$/.test(lastThreeChars)) {
        return "FREEMIUM_2";
      }
    }
    return "FREEMIUM_2"; // Early detection for AAA format
  }

  // Premium check (AA-0000-AA-AAA)
  if (/^[A-Z]{2}/.test(firstTwoChars)) { 
    if (cleanText.length >= 6) {
      const middlePart = cleanText.slice(2, 6);
      const lastTwoChars = cleanText.slice(6, 8);
      if (/^\d{4}$/.test(middlePart) && /^[A-Z]{2}$/.test(lastTwoChars)) {
        return "PREMIUM";
      }
    }
    if (cleanText.length >= 3 && /^[A-Z]{2}\d+$/.test(cleanText)) {
      return "PREMIUM";
    }
  }

  // Numeric start checks
  if (/^\d/.test(firstThreeChars)) {
    if (cleanText.length >= 3) {
      const afterNumbers = cleanText.slice(3, 7);
      if (/^[A-Z]{1,4}$/.test(afterNumbers)) {
        return "FREEMIUM_3"; // 000-AAAA-USA
      } else if (/^[A-Z]{1,2}$/.test(afterNumbers.slice(0, 2))) {
        return "FREEMIUM_1"; // 000-AA-000-USA
      }
    }
  }

  return undefined;
}

export interface CallsMaskInputProps {
  value: string;
  className?: string;
  onChange: (masked: string, format: FormatType | "") => void;
}

const CallsMaskInput = ({
  value,
  onChange,
  className = "",
}: CallsMaskInputProps) => {
  const [currentFormat, setCurrentFormat] = useState<FormatType | undefined>(undefined);

  const handleChangeText = (text: string) => {
    const upperText = text.toUpperCase();
    let format = detectFormat(upperText);
    
    // Forcer le format PREMIUM pour "AA1234" et ajouter le tiret
    if (!format && /^[A-Z]{2}\d{3,4}$/.test(upperText.replace(/[^A-Z0-9]/g, ""))) {
      format = "PREMIUM";
      const cleanText = upperText.replace(/[^A-Z0-9]/g, "");
      const maskedWithDash = `${cleanText.slice(0, 2)}-${cleanText.slice(2)}`;
      setCurrentFormat(format);
      onChange(maskedWithDash, format);
      return;
    }

    // Appliquer le masque correspondant
    const { masked } = formatWithMask({
      text: upperText,
      mask: format ? FORMAT_MASKS[format] : undefined,
    });

    setCurrentFormat(format);
    onChange(masked, format || "");
  };

  useEffect(() => {
    const format = detectFormat(value.toUpperCase());
    if (format !== currentFormat) {
      setCurrentFormat(format);
    }
  }, [value, currentFormat]);

  return (
    <MaskInput
      value={value}
      onChangeText={handleChangeText}
      maskAutoComplete={true}
      showSoftInputOnFocus={false}
      mask={currentFormat ? FORMAT_MASKS[currentFormat] : undefined}
      className={clsx(
        "w-[300px] border border-background-300 rounded text-4xl text-center align-baseline px-3",
        className
      )}
    />
  );
};

export default CallsMaskInput;

export { FORMAT_MASKS, detectFormat };