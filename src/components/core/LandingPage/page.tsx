import { ArrowRight } from "lucide-react";

import MyForm from "@/components/TestComponents/MyForm";
import { Button } from "@/components/ui/button";

import Navbar from "./navbar";

const LandingPage = () => {
  return (
    <>
      <div className="fixed w-full bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
      </div>
      {/* <div id="home" className="h-screen items-center justify-center flex">
        <MyForm />
      </div> */}
      <div id="home" className="h-screen items-center justify-center flex">
        <div className="flex flex-col items-center justify-center text-center px-9 gap-6 line">
          <h1 className="font-bold capitalize text-5xl text-center leading-12">
            your <span className="text-primary">healing</span> starts here
          </h1>
          <p className="font-semibold text-base text-center leading-6">
            Discover expert physiotherapists ready to help you relax, recover,
            and recharge
          </p>

          <Button
            variant={"default"}
            className="capitalize w-full flex items-center h-12"
          >
            <span className="text-base">book appointment</span>
            <ArrowRight className="block sm:hidden" />
          </Button>
          <Button
            variant={"outline"}
            className="capitalize w-full flex items-center h-12"
          >
            <span className="text-base">explore</span>
          </Button>
        </div>
      </div>
      <div id="about" className="h-screen items-center justify-center flex">
        <div className="flex flex-col items-center justify-center text-center px-9 gap-6 line">
          <h1 className="font-bold capitalize text-5xl text-center leading-12">
            your healing starts here
          </h1>
          <p className="font-semibold text-base text-center leading-6">
            Discover expert physiotherapists ready to help you relax, recover,
            and recharge
          </p>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
