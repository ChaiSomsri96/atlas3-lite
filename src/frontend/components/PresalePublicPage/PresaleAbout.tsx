import { ExtendedPresale } from "@/frontend/hooks/usePresale";

export const PresaleAbout = ({ presale }: { presale: ExtendedPresale }) => {
  return (
    <div className="mt-6">
      <h3 className="text-gray-400 text-xs">ABOUT</h3>
      <p className="mt-1 whitespace-pre-line break-words">
        {presale.description}
      </p>
    </div>
  );
};
