import LandingPage from "@/app/landing/[slug]/page";
import { blackFridayParams } from "@/lib/landing-path";

export default function BlackFridayPage() {
  return <LandingPage params={blackFridayParams} />;
}
