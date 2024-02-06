export const EmptyState = ({ content }: { content: string }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-10 mt-12">
      <p className="text-gray-200 text-xl font-semibold text-center max-w-2xl">
        {content}
      </p>

      <img src="/assets/empty-state.svg" alt="Empty State" className="w-1/2" />
    </div>
  );
};
