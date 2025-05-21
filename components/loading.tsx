export default function Loading() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="w-[50px] h-[50px] rounded-full border-t-[5px] border-r-[5px] border-t-loading-color border-r-transparent animate-loading-spin" />
    </div>
  );
}
