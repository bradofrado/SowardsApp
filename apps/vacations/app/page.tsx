import { redirect } from "next/navigation";

function HomePage(): never {
  redirect('/plan');
}

export default HomePage;