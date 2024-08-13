import { withAuth } from "next-utils/src/utils/protected-routes-hoc";

const Home = withAuth(async ({ ctx }) => {
  return <div>Budgeting</div>;
});

export default Home;
