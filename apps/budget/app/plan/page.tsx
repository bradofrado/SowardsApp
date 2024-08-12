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

export default async function Plan() {
  const categories = await getCategories({ db: prisma });
  return (
    <CategoryForm categories={categories} saveCategories={saveCategories} />
  );
}
