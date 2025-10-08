import { useState } from "react";
import Head from "next/head";
import { useAuth } from "@/hooks/useAuth";
import { Loading, LoginRequire } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { authenticatedApiCall } from "@/lib/api";
import { CreateSnippetForm } from "@/components";
import { useRouter } from "next/router";
import SeoMetaHead from "@/components/layout/SeoMetaHead";

type FormState = {
  title: string;
  description: string;
  code: string;
  tags: string;
  programmingLanguage: string;
};

const CreateSnippetPage = () => {
  const { user, isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthLoading) return <Loading />;
  if (!user) return <LoginRequire />;



  const onSubmit = async (form: FormState) => {
    setError(null);

    if (!form.title.trim() || !form.code.trim()) {
      setError(t("errors.genericError"));
      return;
    }

    setSubmitting(true);
    try {
      await authenticatedApiCall("/api/snippets", user, {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          code: form.code,
          tags: form.tags
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          programmingLanguage: form.programmingLanguage,
        }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t("errors.genericError"));
    } finally {
      setSubmitting(false);
      router.push(`/`);
    }
  };

  return (
    <>
      <SeoMetaHead pageTitle={t("snippets.create.title")} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <CreateSnippetForm onSubmit={onSubmit} error={error} submitting={submitting} />
      </div>
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export default CreateSnippetPage;