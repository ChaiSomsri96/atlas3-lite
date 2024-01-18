import styled from "styled-components";
import tw from "twin.macro";
import { PrimaryButton } from "./BaseComponents";

export const FormInner = styled.div`
  ${tw`space-y-4 sm:space-y-3`}
`;

export const Input = styled.input`
  ${tw`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400`}
`;

export const Select = styled.select`
  ${tw`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400`}
`;

export const TextArea = styled.textarea`
  ${tw`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400`}
`;

export const Label = styled.p`
  ${tw`text-gray-300 text-sm pb-2`}
`;

export const ErrorMessage = styled.p`
  ${tw`text-red-500 text-sm pt-2`}
`;

export const SubmitButton = styled(PrimaryButton)`
  ${tw`w-full`}
`;
