import Wrapper from "@/layout/Wrapper";
import Home from "@/components/home-9";

export const metadata = {
  title: "MUJobSphere || ค้นหางาน",
  description: "MUJobSphere  - ค้นหางานสำหรับนักศึกษามหิดล",
};

export default function page() {
  return (
    <Wrapper>
      <Home />
    </Wrapper>
  );
}
