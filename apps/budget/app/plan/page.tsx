import Image from "next/image";
import { FormAddRemove } from "ui/src/components/catalyst/form/add-remove";
import {
  Form,
  FormDivider,
  FormRow,
} from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import { CategoryForm } from "./components/category-form";
import { getCategories } from "api/src/repositories/budget/category";
import { saveCategories } from "./components/actions";
import { prisma } from "db/lib/prisma";
import { getTransactions } from "api/src/services/budget";
import { withAuth } from "next-utils/src/utils/protected-routes-hoc";
import { SpendingForm } from "./components/spending/spending-form";

const Plan = withAuth(async ({ ctx }) => {
  const categories = await getCategories({ db: prisma });
  const transactions = await getTransactions(ctx.session.auth.userVacation.id);
  return (
    <>
      <CategoryForm categories={categories} saveCategories={saveCategories} />
      <SpendingForm transactions={transactions} categories={categories} />
    </>
  );
});

export default Plan;
