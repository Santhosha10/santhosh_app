import { Link } from "react-router-dom";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  asideTitle: string;
  asideText: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  children: React.ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#17202a]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="rounded-lg border border-[#dfe4ea] bg-white p-6 shadow-[0_24px_70px_rgba(22,56,50,0.10)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-3xl font-bold tracking-normal text-[#17202a]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                {subtitle}
              </p>
            </div>

            {children}

            <p className="mt-7 text-center text-sm text-[#667085]">
              {footerText}{" "}
              <Link
                to={footerLinkTo}
                className="font-semibold text-[#0f6b5d] underline-offset-4 hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
