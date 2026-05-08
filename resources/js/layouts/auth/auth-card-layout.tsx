import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-3 self-center font-medium group"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 group-hover:shadow-slate-300/50 transition-all duration-300 border border-slate-100">
                        <AppLogoIcon className="size-10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-slate-800">Laper.In</span>
                        <span className="text-sm text-slate-500">Point of Sale</span>
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="px-12 pt-10 pb-0 text-center">
                            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">{title}</CardTitle>
                            <CardDescription className="text-base text-slate-600">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-12 py-10">
                            {children}
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <p className="text-sm text-slate-500">
                        Sistem Point of Sale Modern untuk Kemudahan Usaha Anda
                    </p>
                </div>
            </div>
        </div>
    );
}
