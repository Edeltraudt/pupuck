export default function Loader() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 animate-ping rounded-[30%] border-4 border-accent-500" />
        <span className="absolute inset-0 animate-ping rounded-[30%] border-4 border-accent-500 [animation-delay:0.5s]" />
      </div>
    </div>
  );
}
