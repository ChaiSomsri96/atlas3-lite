import { format } from "date-fns";
import { FilterOption } from "./types";

export const shortenPublicKey = (publicKey: string | undefined) => {
  return `${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`;
};

export const extractFilterOptions = (filterOptions: FilterOption[]) => {
  const options: string[] = [];

  for (const option of filterOptions) {
    if (option.checked) {
      options.push(option.id);
    }
  }

  return options.join(",");
};

const getOrdinalSuffix = (number: number) => {
  const tens = number % 100;
  const units = number % 10;
  if (tens >= 11 && tens <= 13) {
    return "th";
  }
  switch (units) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const formatDate = (dateString: Date): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = format(date, "MMMM");
  return `${month} ${day}${getOrdinalSuffix(day)} `;
};

export const formatDateShort = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const day = parsedDate.getDate();
  const formattedDate = format(
    parsedDate,
    `d'${getOrdinalSuffix(day)}' MMM, yyyy`
  );
  return formattedDate;
};

// export const isDeepEmpty: boolean | any = (obj: any) => {
//   return Object.keys(obj).every((key) => {
//     if (typeof obj[key] === "object") {
//       return isDeepEmpty(obj[key]);
//     }
//     return obj[key] === undefined || obj[key] === null || obj[key] === "";
//   });
// };
