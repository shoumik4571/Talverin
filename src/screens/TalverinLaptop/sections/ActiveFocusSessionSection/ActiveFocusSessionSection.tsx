export const ActiveFocusSessionSection = (): JSX.Element => {
  return (
    <div className="flex w-[620px] h-20 items-center gap-5 px-6 py-0 absolute left-[calc(50.00%_-_220px)] bottom-6 bg-[#ffffffe8] rounded-[100px] overflow-hidden border border-solid border-white shadow-[0px_16px_48px_#24345b18]">
      <img
        className="relative w-[38px] h-[38px]"
        alt="Live indicator"
        src="/live-indicator.svg"
      />
      <div className="flex flex-col items-start gap-[3px] relative flex-1 grow">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-indigo-600 text-[10px] tracking-[0] leading-[14.5px] whitespace-nowrap">
          FOCUS ACTIVE • SYSTEM DESIGN
        </div>
        <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-slate-900 text-[13px] tracking-[0] leading-[18.8px] whitespace-nowrap">
          Scalability &amp; load balancing
        </div>
      </div>
      <div className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-slate-900 text-[26px] tracking-[0] leading-[37.7px] whitespace-nowrap">
        82:14
      </div>
      <img className="relative w-5 h-5" alt="Pause" src="/pause.svg" />
      <img className="relative w-4 h-4" alt="Square" src="/square.svg" />
    </div>
  );
};
