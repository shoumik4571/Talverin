import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const soundBars = ["h-7", "h-[54px]", "h-20", "h-[54px]", "h-7"];

export const LaptopAlarmDialogSection = (): JSX.Element => {
  return (
    <section
      aria-labelledby="laptop-alarm-title"
      className="mx-auto flex w-full max-w-[520px] flex-col items-start gap-6 rounded-[32px] border border-white bg-[#ffffffe8] p-8 shadow-[0px_16px_48px_#24345b18]"
    >
      <header className="flex w-full items-center justify-between">
        <div className="inline-flex items-center gap-3">
          <img className="h-6 w-6" src="/alarm-clock.svg" alt="Alarm clock" />
          <h1
            id="laptop-alarm-title"
            className="whitespace-nowrap font-['Inter',Helvetica] text-[25px] font-normal leading-[36.2px] tracking-[0] text-slate-900"
          >
            Laptop Alarm
          </h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close laptop alarm"
          className="h-auto w-auto p-0"
        >
          <img className="h-[21.7px] w-[20.85px]" src="/icon.svg" alt="" />
        </Button>
      </header>
      <div
        aria-label="Sound preview"
        className="flex h-[100px] w-full items-center justify-center gap-2.5"
      >
        {soundBars.map((height, index) => (
          <span
            key={`sound-bar-${index}`}
            className={`w-3 ${height} rounded-md bg-indigo-600`}
          />
        ))}
      </div>
      <Card className="w-full rounded-[34px] border-0 bg-[linear-gradient(0deg,rgba(191,191,191,0.1)_0%,rgba(191,191,191,0.1)_100%),linear-gradient(0deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.7)_100%)] p-3.5 shadow-[0px_8px_48px_#00000040,0px_0px_0px_0.5px_#dbdbdb,-1.25px_0px_0px_-0.75px_#dbdbdb,1.25px_0px_0px_-0.75px_#dbdbdb]">
        <CardContent className="rounded-[34px] bg-white p-0 shadow-[inset_0px_-40px_10px_-40px_#282828,inset_0px_40px_10px_-40px_#282828,inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(0,0,0,0.13),inset_-1px_0_1px_rgba(0,0,0,0.11)] backdrop-blur-[2px] backdrop-brightness-[110%] [-webkit-backdrop-filter:blur(2px)_brightness(110%)]">
          <div className="flex flex-col items-center gap-2.5 px-2 pb-6 pt-2">
            <p className="self-stretch font-['SF_Pro-Semibold',Helvetica] text-[17px] font-normal leading-[22px] tracking-[-0.43px] text-black">
              A gentle return to focus.
            </p>
            <p className="self-stretch font-['SF_Pro-Regular',Helvetica] text-[17px] font-normal leading-[22px] tracking-[-0.43px] text-black">
              Preview your laptop&apos;s sound before your next session. Keep
              this tab open and your laptop awake.
            </p>
          </div>
          <Button
            type="button"
            aria-label="Play laptop alarm preview"
            className="h-auto w-full rounded-none border-0 bg-transparent p-0 hover:bg-transparent"
          >
            <img
              className="block w-full"
              src="/actions.svg"
              alt="Play laptop alarm preview"
            />
          </Button>
        </CardContent>
      </Card>
      <aside className="flex w-full items-start gap-3 overflow-hidden rounded-xl bg-[#f8fafd] p-4">
        <img className="h-[18px] w-[18px]" src="/laptop.svg" alt="" />
        <p className="flex-1 font-['Inter',Helvetica] text-xs font-normal leading-[17.4px] tracking-[0] text-slate-500">
          Laptop speakers · volume 70%
          <br />
          Your focus session continues behind this dialog.
        </p>
      </aside>
    </section>
  );
};
