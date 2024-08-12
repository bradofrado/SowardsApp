import { getAuthSession } from "next-utils/src/utils/auth";
import { PlaidLink } from "./plaid";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { getExternalLogins } from "api/src/services/budget";

const Home = withAuth(async ({ ctx }) => {
  const accounts = await getExternalLogins(ctx.session.auth.userVacation.id);
  return (
    <div>
      <PlaidLink />
      {accounts.map((account) => (
        <div key={account.account_id}>{account.name}</div>
      ))}
    </div>
  );
});

export default Home;
